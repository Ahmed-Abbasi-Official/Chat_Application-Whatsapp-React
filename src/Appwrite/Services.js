// import { Client, Storage, Databases, ID, Query} from "appwrite";
// import Conf from "../Conf/Conf";
import { doc,setDoc } from "firebase/firestore";
import { db } from "../Conf/Firebase";
class AppwriteServices {
  // client = new Client();
  // databases;
  // bucket;

  // constructor() {
  //   this.client.setEndpoint(Conf.appwriteUrl).setProject(Conf.appprojectid);
  //   this.databases = new Databases(this.client);
  //   this.bucket = new Storage(this.client);
  //   // this.realtime = new Realtime(this.client);
  // }

  // async uploadFiles(file, userId) {
  //   try {
  //     const image = await this.bucket.createFile(
  //       Conf.appwriteBucketid,
  //       userId,
  //       file,
  //     );
  //     console.log('File uploaded successfully:', image);
  //     return image;
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     throw error; // Optional: rethrow the error for further handling
  //   }
  // }

  // async getFile(fileId) {
  //   try {
  //     const res =  this.bucket.getFilePreview(
  //       Conf.appwriteBucketid,
  //       fileId
  //     );
     
  //     return res.href;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async createUsers(payload, userId) {
    try {
      const docRef =await setDoc( doc(db, "users", userId),payload); // Verify db is correctly initialized
      console.log("Document written with ID: ", docRef);
      return docRef;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e; // Optional: rethrow the error for further handling
    }
  }
  async createUsersChats({ chats: [] }, userId) {
    try {
      const docRef = await setDoc( doc(db, "usersChats", userId),{ chats: [] }); // Verify db is correctly initialized
      console.log("Document written with ID: ", docRef);
      return docRef;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e; // Optional: rethrow the error for further handling
    }
  }
  

  // async allUsers(){
  //   try {
  //     const session=await this.databases.listDocuments(Conf.appwriteDatabaseid,Conf.appwriteCollectionUserid)
  //     // console.log(session.documents)
  //     return session.documents
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async searchUsers(userNmae){
  //   console.log(userNmae);
  //   try {
  //     const session=await this.databases.listDocuments(Conf.appwriteDatabaseid,Conf.appwriteCollectionUserid,[Query.endsWith("name", userNmae)])
  //     // console.log(session.documents)
  //     return session.documents
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }


 




  // async createMessage(payload,userId) {
  //   try {
  //     const session = this.databases.createDocument(
  //       Conf.appwriteDatabaseid,
  //       Conf.appwriteCollectionid,
  //       ID.unique(), 
  //       payload,
  //       // [Permission.write(Role.user(userId))]
  //     );
  //     console.log(session);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async allMessages(userId){
  //   try {
  //     const session=await this.databases.listDocuments(Conf.appwriteDatabaseid,Conf.appwriteCollectionid,[
  //       Query.orderAsc('$createdAt'),
  //       Query.equal('userID',userId)
  //     ])
  //     // console.log(session.documents)
  //     return session.documents
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async allRecivedMessages(userId){
  //   try {
  //     const session=await this.databases.listDocuments(Conf.appwriteDatabaseid,Conf.appwriteCollectionid,[
  //       Query.orderAsc('$createdAt'),
  //       Query.notEqual('userID',userId)
  //     ])
  //     console.log(session.documents)
  //     return session.documents
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // subscribeToMessages() {
  //   try {
  //     const unsubscribe = this.client .subscribe(
  //       `databases.${Conf.appwriteDatabaseid}.collections.${Conf.appwriteCollectionid}.documents`,
  //       (response) => {
  //         console.log('Subscription response:', response);
  //         if (response.events.includes('databases.*.collections.*.documents.*.create')) {
  //           console.log('Document created:', response.payload);
  //         } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
  //           console.log('Document updated:', response.payload);
  //         } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
  //           console.log('Document deleted:', response.payload);
  //         } else {
  //           console.log('Unknown event:', response);
  //         }
  //       }
  //     );
  //     return unsubscribe;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // async deleteDocumnet(slug){
  //   try {
  //     return await this.databases.deleteDocument(Conf.appwriteDatabaseid,Conf.appwriteCollectionUserid,slug)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}

const appwriteServices = new AppwriteServices();
export default appwriteServices;
