import {Song} from "../models/song.model.js"
export const getAllSongs = async (req,res,next)=>{
    try {
        //-1 is refers to descending which means the newest one to the oldest one
        const songs = await Song.find({}).sort({createdAt:-1})
        res.json(songs)
        
    } catch (error) {
        next(error)
        
    }
}

export const getFeatured=async(req,res,next)=>{
    try {
        const songs = await Song.aggregate([{
            $sample:{size:20}
        },{
            $project:{_id:1,title:1,imageUrl:1,artist:1,}
        }])
        req.json(songs);
        
    } catch (error) {
        next(error);
        
    }
}
export const getTrending=async(req,res,next)=>{
    try {
        const songs = await Song.aggregate([{
            $sample:{size:20}
        },{
            $project:{_id:1,title:1,imageUrl:1,artist:1,}
        }])
        req.json(songs);
        
    } catch (error) {
        next(error);
        
    }
}
export const getMadeForYour=async(req,res,next)=>{
    try {
        const songs = await Song.aggregate([{
            $sample:{size:20}
        },{
            $project:{_id:1,title:1,imageUrl:1,artist:1,}
        }])
        req.json(songs);
        
    } catch (error) {
        next(error);
        
    }
}