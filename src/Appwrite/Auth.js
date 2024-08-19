// import { Client, Account, ID } from "appwrite";
// import Conf from "../Conf/Conf";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,getAuth } from "firebase/auth";
import { auth } from "../Conf/Firebase";

export class AppwriteAuth {
  // client = new Client();
  // account;
  

  // constructor() {
  //   this.client
  //   .setEndpoint(Conf.appwriteUrl)
  //   .setProject(Conf.appprojectid);
  //   this.account = new Account(this.client);
  
  // }

  

  async createAccount({name,email,password}){
    try {
        const userAccount=await createUserWithEmailAndPassword(auth,email,password)

        const user=userAccount.user
      console.log(user);
        await updateProfile(user,{
          displayName:name
        })

        if(userAccount){

         return   this.login({email,password})
        }else{
          return userAccount
        }
    } catch (error) {
        throw(error);
    }
}

async login({email,password}){
    try {
        
        return await signInWithEmailAndPassword(auth,email,password)
    } catch (error) {
        throw error
    }
}

async  getCurrentUser() {
  try {
      const user = getAuth().currentUser;
      if (user) {
          // User is signed in
          console.log("Current user fetched successfully", user);
          return user;
      } else {
          // No user is signed in
          console.log("No user is currently signed in");
          return null;
      }
  } catch (error) {
      console.log("Firebase service :: getCurrentUser :: error", error);
      return null;
  }
}

  async logout() {
    try {
      return auth.signOut();
    } catch (error) {
      console.log(error);
    }
  }

 

}

const appwriteAuth = new AppwriteAuth();
export default appwriteAuth;
