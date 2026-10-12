const supabase = require("../config/db");

const SUBJECT_BY_SEMESTER = {
  "1": "Applied Calculus",
  "2": "Linear Algebra",
  "3": "Discrete Mathematics",
  "4": "Probability & Statistics",
};

function getSubjectForSemester(semester) {
  return SUBJECT_BY_SEMESTER[String(semester)] || null;
}

function normalizeUnit(unit) {
  if (!unit) return null;
  const match = String(unit).match(/Unit\s*([1-5])/i);
  return match ? `Unit ${match[1]}` : String(unit).trim();
}

// GET /api/resources
// Public
// Supports: semester, subject, unit, resourceType
const getResources = async (req, res, next) => {
  try {
    const { semester, subject, unit, resourceType } = req.query;

    let query = supabase
      .from("resources")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (semester) {
      query = query.eq("semester", Number(semester));
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    // Formula sheets are semester-level resources. If a unit is selected
    // without a specific type, return that unit's resources + formula sheets.
    if (unit && !resourceType) {
      const normalizedUnit = normalizeUnit(unit);
      query = query.or(
        `unit.eq.${normalizedUnit},resource_type.eq.Formula Sheet`
      );
    } else if (unit) {
      query = query.eq("unit", normalizeUnit(unit));
    }

    if (resourceType) {
      query = query.eq("resource_type", resourceType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Resources fetched successfully",
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/resources/search?q=matrices&semester=1&unit=Unit%201
// Public
// Search is word-based: a resource matches if ANY search word occurs
// in title, description, subject, unit, topic, or resource_type.
const searchResources = async (req, res, next) => {
  try {
    const { q, semester, subject, unit, resourceType } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query 'q' is required",
      });
    }

    let query = supabase
      .from("resources")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (semester) query = query.eq("semester", Number(semester));
    if (subject) query = query.eq("subject", subject);

    if (unit && !resourceType) {
      query = query.or(
        `unit.eq.${normalizeUnit(unit)},resource_type.eq.Formula Sheet`
      );
    } else if (unit) {
      query = query.eq("unit", normalizeUnit(unit));
    }

    if (resourceType) query = query.eq("resource_type", resourceType);

    const { data, error } = await query;
    if (error) throw error;

    const words = q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const results = (data || []).filter((resource) => {
      const haystack = [
        resource.title,
        resource.description,
        resource.subject,
        resource.unit,
        resource.topic,
        resource.resource_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return words.some((word) => haystack.includes(word));
    });

    res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/resources/user/my-resources
// Private
const getMyResources = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("uploaded_by", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Your resources fetched successfully",
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/resources/:id
// Public
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Resource fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// POST /api/resources
// Private
// JSON body compatible with the current frontend upload form.
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject,
      semester,
      unit,
      resourceType,
      resource_type,
      youtube_url,
      file_url,
    } = req.body;

    const type = resourceType || resource_type;

    if (!title || !semester || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, semester, and resourceType are required",
      });
    }

    const allowedTypes = [
      "Video",
      "Playlist",
      "Formula Sheet",
      "Question Paper",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resourceType. Use Video, Playlist, Formula Sheet, or Question Paper.",
      });
    }

    const resolvedSubject = subject || getSubjectForSemester(semester);

    if (!resolvedSubject) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester. Use 1, 2, 3, or 4.",
      });
    }

    // Formula sheets are semester-level, so they do not need a unit.
    // Other resources use the selected unit when supplied.
    const normalizedUnit =
      type === "Formula Sheet" ? null : normalizeUnit(unit);

    if (type !== "Formula Sheet" && !normalizedUnit) {
      return res.status(400).json({
        success: false,
        message: "Unit is required for this resource type",
      });
    }

    const status =
      req.user.role === "admin" ? "approved" : "pending";

    const payload = {
      title: title.trim(),
      description: description || "",
      subject: resolvedSubject,
      semester: Number(semester),
      unit: normalizedUnit,
      resource_type: type,
      youtube_url: youtube_url || null,
      file_url: file_url || null,
      uploaded_by: req.user.id,
      status,
    };

    const { data, error } = await supabase
      .from("resources")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE /api/resources/:id
// Private
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: resource, error: fetchError } = await supabase
      .from("resources")
      .select("id, uploaded_by")
      .eq("id", id)
      .single();

    if (fetchError || !resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const isOwner = resource.uploaded_by === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this resource",
      });
    }

    const { error: deleteError } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

const getFormulaSheets = async (req, res, next) => {
  try {
    const files = [
      {
        semester: 1,
        subject: "Applied Calculus",
        fileName: "Applied Calculus.pdf",
      },
      {
        semester: 2,
        subject: "Linear Algebra",
        fileName: "Linear Algebra.pdf",
      },
      {
        semester: 3,
        subject: "Discrete Mathematics",
        fileName: "Discrete Mathematics.pdf",
      },
      {
        semester: 4,
        subject: "Probability & Statistics",
        fileName: "Probability & Statistics.pdf",
      },
    ];

    const data = files.map((file) => {
      const { data: publicUrl } = supabase.storage
        .from("resource-pdfs")
        .getPublicUrl(file.fileName);

      return {
        semester: file.semester,
        subject: file.subject,
        file_name: file.fileName,
        file_url: publicUrl.publicUrl,
      };
    });

    res.status(200).json({
      success: true,
      message: "Formula sheets fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  searchResources,
  getMyResources,
  getResourceById,
  createResource,
  deleteResource,
  getFormulaSheets,
};