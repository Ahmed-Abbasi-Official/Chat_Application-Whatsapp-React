const Conf={
    appwriteUrl:String(import.meta.env.VITE_APPWRITE_URL),
    appprojectid:String(import.meta.env.VITE_PROJECT_ID),
    appwriteBucketid:String(import.meta.env.VITE_BUCKET_ID),
    appwriteDatabaseid:String(import.meta.env.VITE_Database_ID),
    appwriteCollectionid:String(import.meta.env.VITE_COLLECTION_ID),
    appwriteCollectionUserid:String(import.meta.env.VITE_COLLECTIONUSER_ID),
}
export default Conf