const Post = require('../models/Post');
const authchecker = require('../utilities/authchecker');
const checkAuth = require('../utilities/authchecker');
const {AuthenticationError, UserInputError} = require('apollo-server');
const { argsToArgsConfig } = require('graphql/type/definition');
module.exports={
    Query:{
        async getPosts(){
          try{
            const posts= await Post.find().sort({createdAt: -1}); 
            return posts;
          } catch(err){
            throw new Error(err);
          }
         },
          async getPost(parent, {postId}){
            try{
              const post= await Post.findById(postId);
              if(post){
                return post;
              }else{
                throw new Error('post not found')
              }
            }catch(err){
              throw new Error(err)
            }
          }
        },
        Mutation: {
          async createPost(_, {body}, context){
            const user= checkAuth(context);

            if(body.trim()=== ''){
              throw new Error('post must not be empty');
            }

            const newPost= new Post({
              body,
              user:user.id,
              username: user.username,
              createdAt:new Date().toISOString()
            })

            const post = await newPost.save();
            return post;
          },
          async deletePost(_, {postId}, context){
            const user= authchecker(context);
            try{
              const post= await Post.findById(postId);
              if(user.username===post.username){
                await post.deleteOne();
                return 'post deleted successfully' 
              }else{
                throw new AuthenticationError('Action not allowed');
              }
            }catch(err){
              throw new Error(err);
            }

          },
          async likePost(_,{postId}, context){
            const user= checkAuth(context);
            const post= await Post.findById(postId);

            if(post){
              if(post.likes.find(like => like.username === user.username)){
                //already liked so unlike
              post.likes=post.likes.filter(like=> like.username!==user.username);
                await post.save();
              }else{
                //not liked
                const {username} = user;
                post.likes.push({
                 username,
                 createdAt: new Date().toISOString()
                })
                
              }
              await post.save();
              return post;

            }else throw new UserInputError('Post not found');
          }
        }
};