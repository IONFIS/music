import { clerkClient } from "@clerk/express";
import { requireAuth } from "@clerk/express";

export const protectRoute = (req, res, next) => {
  requireAuth()(req, res, () => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }
    next();
  });
};

export const requireAdmin = async(req,res,next)=>{
    try {
        
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin =process.env.ADMIN === currentUser.primaryEmailAddress.emailAddress;

        if(!isAdmin){
            return res.status(403).json({message:"Unauthorized You are not admin "})
        }
        next()
    } catch (error) {
        next(error)
        
    }
}