const path = require('path');
const Posts = require('../models/bucket');

const control = {};

control.index = async(req, res) => {
    console.log('param: ' + req.params.post_id);
    const Post = await Posts.findOne({ id: req.params.post_id }).lean()
    console.log('found post: ' + Post);
    const user = req.session.user_name;
    const name = req.session.user;
    const email = req.session.email;

    /*const contexto = {
        filetype: Post.filetype,
        extension: Post.extension,
        author: Post.author,
        date: Post.date,
        id: Post.id,
        url: Post.url,
        title: Post.title,
        description: Post.description,
        likes: Post.likes,
        __v: Post.__v,
        isHLSCoded: Post.isHLSCoded,
        thumbURL: Post.thumbURL,
        text_size: Post.text_size,
        author_size: Post.author_size,

    }*/

    res.render('post', {
        user_name: user,
        name: name,
        email: email,
        postal: Post,
        style: 'post.css',
    });
}

async(req, res) => {
    var context;
    await postales.findOne({ id: req.params.post_id /*'caf75d5b-3161-47cc-8144-6372aba4cb39'*/ }).then(document => {
        console.log('dokumento: ' + document)
        context = {

            //id: document._id,
            filetype: document.filetype,
            extension: document.extension,
            author: document.author,
            date: document.date,
            id: document.id,
            url: document.url,
            title: document.title,
            description: document.description,
            likes: document.likes,
            __v: document.__v,
            isHLSCoded: document.isHLSCoded,
            thumbURL: document.thumbURL,
            text_size: document.text_size,
            author_size: document.author_size,

        }
    })

    res.render('post', {
        user_name: req.session.user_name,
        name: req.session.user,
        email: req.session.email,
        postal: context,
    })

}

module.exports = control;