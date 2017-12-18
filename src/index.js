import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Data from './data/imgData.json'

//创建图片组件
 class ImgFigure  extends React.Component {
 	constructor(props) {
 		super(props);
 		this.handleClick = this.handleClick.bind(this);//如果在调用handleClick方法后面加（），应该为其绑定this
 	}

 	handleClick(e) {//如果图片居中了就翻转，未居中则居中
 		if (this.props.arrange.isCenter) {
 			this.props.inverse();
 		} else {
 			this.props.center();
 		}
 		e.stopPropagation();//终止事件在传播过程的捕获、目标处理或起泡阶段进一步传播
 		e.preventDefault();//阻止点击事件的默认行为
 	}

 	render() {
 		var styleObj = {};
    	//如果props属性中指定了这张图片的位置,则使用
    	if (this.props.arrange.pos) {
     		styleObj.left = this.props.arrange.pos.left;
     		styleObj.top = this.props.arrange.pos.top;
   		}

    	//如果图片的旋转角度有值并且不为0，添加旋转角度
    	if (this.props.arrange.rotate) {
      		(['Moz', 'Ms', 'Webkit', '']).forEach((value) => {
        		styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      		});
    	}
    	//如果图片居中，则设置zIndex使其在最上层
    	if (this.props.arrange.isCenter) {
    		styleObj.zIndex = 11;
    	}
    	//如果图片翻转，则添加“is-inverse”类
    	let imgFigureClassName = 'img-figure';
		imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse ' : '';

 		return (
 			<figure style={styleObj} className={imgFigureClassName} onClick={this.handleClick}>
 				<img src={this.props.data.imgUrl}
 				 alt={this.props.data.title}/>
 				<figcaption>
 				<h2 className='img-title'>{this.props.data.title}</h2>
 				</figcaption>
 				<div className="img-back" onClick={this.handleClick}>
 					<p>
 						{this.props.data.desc}
 					</p>
 				</div>
 			</figure>
 		);
 	}
 	
 }

 //控制结构组件（思路基本与imgFigure相同）
 class ControllerUnit extends React.Component {   
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
     	if (this.props.arrange.isCenter) {
     		this.props.inverse();
     	} else {
     		this.props.center();
     	}
     	e.preventDefault();
     	e.stopPropagation();
    }
 
    render() {
     	var ControllerUnitClassName = 'controllerUnit';
     	if (this.props.arrange.isCenter) {
     		ControllerUnitClassName += ' is-center';
     	}

     	if (this.props.arrange.isInverse) {
     		ControllerUnitClassName += ' is-inverse';
     	}

    return (
             <span className={ControllerUnitClassName} onClick={this.handleClick}></span>
        );
    }
}

//背景舞台组件
class Stage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			//构建图片信息数组包括位置，角度，是否翻转和居中
			imgInfoArr: [
				{
					pos: {
						left: '0',
						top: '0'
					},
					rotate:0,
					isInverse:false,
					isCenter:false
				}
			]	
		};
		//内部变量：记录中心位置、水平垂直方向取值范围
		this.Constant = {
				centerPos: {
					left: 0,
					top: 0
				},
				hPosRange: { //水平方向取值范围
					leftSecX: [0, 0],
					rightSecX: [0, 0],
					y: [0, 0]
				},
				vPosRange: { //垂直方向取值范围
					x: [0, 0],
					topY: [0, 0]			
				}
			};
		}

	//组件加载以后，为每张图片加载位置的范围
	componentDidMount() {
		//分别获取舞台和图片组件的宽高
	    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
	    	stageH = stageDOM.scrollHeight,
	    	stageW = stageDOM.scrollWidth,
	    	halfStageH = Math.ceil(stageH / 2),
	    	halfStageW = Math.ceil(stageW / 2);

	    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
	    	imgH = imgFigureDOM.scrollHeight,
	    	imgW = imgFigureDOM.scrollWidth,
	    	halfImgH = Math.ceil(imgH / 2),
	    	halfImgW = Math.ceil(imgW / 2);


		this.Constant = {
			//计算取值范围并赋值给Constant
				centerPos: {
					left: halfStageW - halfImgW,
					top: halfStageH - halfImgH + 50
				},
				hPosRange: { //水平方向取值范围
					leftSecX: [-halfImgW, halfStageW - halfImgW * 3],
					rightSecX: [halfStageW + halfImgW, stageW - halfImgW],
					y: [-halfImgH, stageH - halfImgH]
				},
				vPosRange: { //垂直方向取值范围
					x: [halfStageW - imgW, halfStageW],
					topY: [-halfImgH, halfStageH - halfImgH * 3]			
				}
			};
		//加载完成后进行布局
	    this.setPosition(0);

	}
	//获取low、high之间的随机值
	getRandomValue(low, high) {
		return Math.ceil(Math.random() * (high - low) + low);
	}
	//获取正负30之间的随机值
	get30DeRandom() {
		return (Math.random() > 0.5 ? "" : '-') + Math.ceil(Math.random() * 30);
	}
	//翻转
	inverse(index) {
		return function () {
			var imgInfoArr = this.state.imgInfoArr;
			imgInfoArr[index].isInverse = !imgInfoArr[index].isInverse;
			this.setState({
				imgInfoArr:imgInfoArr
			});
		}.bind(this);
	}
	//居中
	center(index) {
		return () => {
			this.setPosition(index);
		}
	}
	//设置图片位置，centerIndex是居中图片的索引值
	setPosition(cneterIndex) {
		var centerPos = this.Constant.centerPos,
			hLeftXMin = this.Constant.hPosRange.leftSecX[0],
			hLeftXMax = this.Constant.hPosRange.leftSecX[1],
			hRightXMin = this.Constant.hPosRange.rightSecX[0],
			hRightXMax = this.Constant.hPosRange.rightSecX[1],
			hYMin = this.Constant.hPosRange.y[0],
			hYMax = this.Constant.hPosRange.y[1],
			vXMin = this.Constant.vPosRange.x[0],
			vXMax = this.Constant.vPosRange.x[1],
			vYMin = this.Constant.vPosRange.topY[0],
			vYMax = this.Constant.vPosRange.topY[1];

		var imgInfoArr = this.state.imgInfoArr;
		//获取居中图片并设置其值
		var cneterArr = imgInfoArr.splice(cneterIndex, 1);
		cneterArr[0].pos = centerPos;
		cneterArr[0].rotate = 0;
		cneterArr[0].isCenter = true;

		//获取在上方的图片（0或1个）
		var topImgNum = Math.floor(Math.random() * 2);
		var topIndex = Math.ceil(Math.random() * (imgInfoArr.length - topImgNum));
		var topArr = imgInfoArr.splice(topIndex, topImgNum);
			topArr.forEach(function(element, index) {
			topArr[index] = {
				pos: {
					left: this.getRandomValue(vXMin, vXMax),
					top: this.getRandomValue(vYMin, vYMax)
				},
				rotate:this.get30DeRandom(),
				isCenter:false,
			}
		}.bind(this));
        //将剩下的图片对半分放于左右两边
		for (let i = 0, j = imgInfoArr.length, k = j / 2; i < j; i++) {
			var hPosLOrR = null;
			if (i < k) {
				hPosLOrR = this.getRandomValue(hLeftXMin, hLeftXMax);
			} else {
				hPosLOrR = this.getRandomValue(hRightXMin, hRightXMax);
			}
			imgInfoArr[i] = {
				pos: {
					left:hPosLOrR,
					top:this.getRandomValue(hYMin, hYMax)
				},
				rotate: this.get30DeRandom(),
				isCenter:false,
			};
		}
		//按顺序将顶部与中心图片数据传回数组
		if (topArr && topArr[0]) {
			imgInfoArr.splice(topIndex, 0, topArr[0]);
		}
		imgInfoArr.splice(cneterIndex, 0, cneterArr[0]);
				
		this.setState({
			imgInfoArr:imgInfoArr
		});
	}

    render() {
    	var imgs = [];
    	var controllers = [];
    	Data.forEach( function(value, index) {
    		//初始化图片数据数组，不能用setState方法，否则每次都会触发渲染
    		if (!this.state.imgInfoArr[index]) {
        		this.state.imgInfoArr[index] = {
         			pos: {
         				left: 0,
          				top: 0
      			    },
          			rotate: 0,
          			isInverse: false,
          			isCenter:false		
        		}
      		}
    		value.imgUrl = require('./images/' + value.fileName);
    		imgs.push(<ImgFigure arrange={this.state.imgInfoArr[index]} key={index} ref={'imgFigure' + index} data={value} inverse={this.inverse(index)} center={this.center(index)}/>);
    		controllers.push(<ControllerUnit key={index} arrange={this.state.imgInfoArr[index]} inverse={this.inverse(index)} center={this.center(index)} />)
    	}.bind(this));

        return (
            <section className="stage" ref='stage'>
            	<section className="imgStage">{imgs}</section>
            	<nav className="controller">{controllers}</nav>
            </section>
        );
    }
}

ReactDOM.render(<Stage />, document.getElementById('root'));

