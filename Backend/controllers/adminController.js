const supabase = require("../config/db");

// @route   GET /api/admin/resources/pending
// @access  Private/Admin
const getPendingResources = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Pending resources fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// @route   PATCH /api/admin/resources/:id/approve
// @access  Private/Admin
const approveResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: resource, error: findError } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const { data, error } = await supabase
      .from("resources")
      .update({
        status: "approved",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Resource approved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// @route   PATCH /api/admin/resources/:id/reject
// @access  Private/Admin
const rejectResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: resource, error: findError } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const { data, error } = await supabase
      .from("resources")
      .update({
        status: "rejected",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Resource rejected successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// @route   DELETE /api/admin/resources/:id
// @desc    Admin can delete any resource
// @access  Private/Admin
const adminDeleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: resource, error: findError } = await supabase
      .from("resources")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const { error: deleteError } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully by admin",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getPendingResources,
  approveResource,
  rejectResource,
  adminDeleteResource,
};