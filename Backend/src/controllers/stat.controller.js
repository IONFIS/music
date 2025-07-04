import { User } from "../models/user.model.js"
import { Album } from "../models/album.model.js"
import { Song } from "../models/song.model.js"

export const getStat = async(req,res,next)=>{
    try {const {totalSongs,totalAlbums,totalUsers,totalArtist}= await Promise.all([
        Song.countDocuments(),
        Album.countDocuments(),
        User.countDocuments(),
        Song.aggregate([
            {$unionWith:{
                coll:"albums",
                pipeline:[],
            },},
            {$group:{_id:"$artist",count:{$sum:1}}}])

    ]);
     res.status(200).json({totalSongs,totalAlbums,totalUsers,totalArtist:uniqueArtist[0]?.count || 0,});
        
    } catch (error) {
        
    }
}