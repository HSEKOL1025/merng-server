const Post= require('../models/Post')
const authChecker= require('../utilities/authchecker')
const {UserInputError, AuthenticationError}= require('apollo-server')
module.exports={
    Mutation: {
        createComment: async(_,{postId, body}, context)=>{
            const user = await authChecker(context)
            if(body.trim()===''){
                throw new UserInputError(' Empty comment', {
                    errors:{
                        body:'comment body must not be empty'
                    }
                })
               
            }
            const post= await Post.findById(postId);
            if(post){
                post.comments.unshift({ 
                    body,
                    username: user.username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            }else{
                throw new UserInputError('post not found')
            }
        },
        async deleteComment(_,{postId, commentId}, context){
            const user= authChecker(context);

            const post= await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if(post.comments[commentIndex].username === user.username ){
                post.comments.splice(commentIndex,1);
                await post.save();
                return post;
                }else{
                    throw new AuthenticationError ('Action not allowed');
                }
            }else{
                throw new UserInputError('Post not found')
            }
        }
    }
}