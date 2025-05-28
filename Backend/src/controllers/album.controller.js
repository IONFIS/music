import {Album} from "../models/album.model.js";

export const getAlbum =async(res,req,next)=>{
    try {
        const albums = await Album.find()
        return res.status(200).json(albums)
        
    } catch (error) {
next(error);
    }
    
}
export const getAlbumById =async(res,req,next)=>{
    try{
        const {albumId}=req.params;
        const album = await Album.findyById(albumId).populate("songs");
        if(!album){
            return res.status(404).json({message:"album not found"});
        }

        res.status(200).json(album);
    } catch (error){
        next(error);
    }

}