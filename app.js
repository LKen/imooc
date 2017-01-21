// 加载进程模块
var express = require('express')
// 调用路径模块， 用于设置某些文件的查找位置
var path = require('path')
//mongodb模块
var mongoose = require('mongoose')

//underscore 模块用于更新已经存在的数据集
// var _ = require('underscore')

var Movie = require('./models/movie')
// 当前端口号 或者自定义的端口号
var port = process.env.POST || 3000
// 定义进程实例
var app = express()
//链接数据库
mongoose.connect('mongodb://127.0.0.1:27017/imooc')
//视图模块路径
app.set('views', './views/pages')
//m模块引擎
app.set('view engine', 'jade')

// 处理表单数据
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())
//定义moment模块 加载时间Date()
app.locals.moment = require('moment')
//为了安装bower 管理bootstrap 和 jquery
var serveStatic = require('serve-static')
app.use(serveStatic('public'))

// 配置当前路径
// app.use(express.static(path.join(__dirname,'node_modules')))
app.listen(port)

console.log("imooc started on port : " + port);

//index page 添加首页路由
app.get("/", (req,res)=> {
	Movie.fetch((err,movies)=> {
		if(err) {
			console.log(err);
		}
		res.render('index',{
			title: 'imooc 首页',
			movies: movies
		})
	})
})
// detail page 每一步电影的详情页 :id 代表 .id
app.get('/movie/:id', (req,res)=> {
	var id = req.params.id
	Movie.findById(id, (err,movie)=> {

		res.render('detail', {
			title :'imooc 详情页',
			movie: movie
		})
	})
})

//admin page 后台录入 的 路由
app.get('/admin/movie',(req,res)=> {
	res.render('admin', {
			title: 'imooc 后台录入页',
			movie: {
				title: '',
				doctor: '',
				country: '',
				year: '',
				poster: '',
				flash: '',
				summary: '',
				language: ''
			}
		})
})

// 后台更新 更新的路由（接口）
app.get('/admin/update/:id' , (req,res)=> {
	var id = req.params.id
	if(id)
		Movie.findById(id , (err,movie)=> {
			res.render('admin', {
				title: 'imooc 后台更新页',
				movie: movie
			})
		})
})

// admin post moive 表单数据提交的页面 post路由
app.post('/admin/movie/new',(req,res)=> {
	var id= req.body.movie._id
	var movieObj = req.body.movie
	var _movie
	if(id !== 'undefined') {
		// Movie.findById(id, (err,movie)=> {
		// 	if(err) {
		// 		console.log(err)
		// 	}
		// 	_moive = _.extend(movie , movieObj)
		// 	_movie.save(function(err,movie) {
		// 		if(err) {
		// 			console.log(err)
		// 		}
		// 		res.redirect('/movie/' + movie._id)
		// 	})
		// })
		Movie.findOneAndUpdate({_id: id},movieObj,(err,movie)=> {
			if(err) {
				console.log(err)
				return;
			}
			res.redirect('/movie/' + movie._id)
		})

	} else {
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		})
		_movie.save(function(err, movie) {
			if (err) {
				console.log(err)
			}
			res.redirect('/movie/' + movie._id)
		})
	}
})

//list page 路由
app.get('/admin/list',(req,res)=> {
	Movie.fetch((err, movies)=>{
		if (err) {
			console.log(err)
		}
		res.render('list', {
			title: 'imooc 列表页',
			movies: movies
		})
	})
})

//list delete movie
app.delete('/admin/list',(req,res)=> {
	//不同于 parmas.id
	var id = req.query.id 
	if(id) {
		Movie.remove({
			_id:id
		},function(err,movie) {
			if(err) {
				console.log(err)
			}
			else{
				res.json({success: 1})
			}
		})
	}
})
