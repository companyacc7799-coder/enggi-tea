const supabase = require("../config/db");

// Verify Supabase access token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    let { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, name, email, role, created_at")
        .eq("id", user.id)
        .single();

    /* Users created through Google OAuth (or any flow that
       bypasses the app's register endpoint) may not have a
       profile row yet. Create one from the auth user's data
       instead of failing — otherwise they get logged out
       again and again. */
    if (profileError && profileError.code === "PGRST116") {
      const fallbackName =
        (user.user_metadata &&
          (user.user_metadata.name || user.user_metadata.full_name)) ||
        (user.email || "").split("@")[0] ||
        "User";

      const { data: createdProfile, error: createError } =
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: fallbackName,
            email: user.email,
            role: "user",
          })
          .select("id, name, email, role, created_at")
          .single();

      if (createError || !createdProfile) {
        console.error("Profile auto-create failed:", createError);
        return res.status(500).json({
          success: false,
          message: "Could not create the user profile",
        });
      }

      profile = createdProfile;
    } else if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        message: "User profile not found",
      });
    }

    req.user = profile;
    req.authUser = user;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
    });
  }
};

module.exports = protect;