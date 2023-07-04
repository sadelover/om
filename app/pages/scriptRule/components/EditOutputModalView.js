/**
 * 编辑、删除 输入规则-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { modalTypes } from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer';

import http from '../../../common/http';

const RadioGroup = Radio.Group;
const { TextArea } = Input;


let modalToggleClass, calendarToggleClass, selectToggleClass, btnStyle;
if (localStorage.getItem('serverOmd') == "persagy") {
	modalToggleClass = 'persagy-modal-style persagy-history-label persagy-history-modal';
	calendarToggleClass = 'persagy-history-calendar-picker';
	selectToggleClass = 'persagy-history-select-selection';
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "14px",
		fontFamily: 'MicrosoftYaHei'
	}
}

const Option = Select.Option;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class EditOutputModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type: 1
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleHidePointModal = this.handleHidePointModal.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handlePdfModal = this.handlePdfModal.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.outputScript != "") {
				let obj = {}
				obj['script'] = values.outputScript
				obj['title'] = values.scriptDesc
				this.props.handleOk(obj);
				this.props.handleHide();
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedPoint !== this.props.selectedPoint && nextProps.selectedPoint.name !== this.props.selectedPoint.name && nextProps.selectedPoint.name != undefined) {
			let pointName = nextProps.selectedPoint.name
			let outputScript = nextProps.form.getFieldValue('outputScript') != undefined ? nextProps.form.getFieldValue('outputScript') : '';
			let scriptDesc = nextProps.form.getFieldValue('scriptDesc') != undefined ? nextProps.form.getFieldValue('scriptDesc') : '';
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				outputScript: `${outputScript}<%${pointName}%>`,
				scriptDesc: scriptDesc + nextProps.selectedPoint.description
			})
		}
		if (nextProps.visible && !this.props.visible) {
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				outputScript: nextProps.editOutputScript,
				scriptDesc: nextProps.editOutputDesc
			})
		}
	}


	handleChangeType = e => {
		this.setState({ type: e.target.value });
	}

	handleHidePointModal = () => {
		const {showPointModal,onSelectChange} = this.props
		onSelectChange([])
        showPointModal(modalTypes.POINT_MODAL)
	}

	handleDelete = () => {
		let _this = this
		Modal.confirm({
			title: '是否确定删除该输入条件？',
			content: '点击"确定"按钮删除该输入条件！',
			onOk() {
				_this.props.deleteOutput();
			},
			onCancel() { }
		})

	}

	// changeScript = () => {
	// 	let pointName = this.props.selectedPoint.name

	// 	let outputScript = this.props.form.getFieldValue('outputScript');

	// 	const { setFieldsValue } = this.props.form



	// 	setFieldsValue({
	// 		outputScript: timeStart
	// 	})

	// }	

	handlePdfModal() {
		Modal.info({
			title: 'API文档',
			width:'1200px',
			content: (
				<div>
					<iframe src='https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/temp/API%E6%96%87%E6%A1%A3.pdf'width='1100' height='700'></iframe>
				</div>
			)
		})
	}

	//测试公式
	modifyPointDescription=()=> {
		let inputScript = this.props.form.getFieldValue('inputScript');
		http.post('/tool/evalStringExpression', {
			"str": inputScript,
			"debug": 1
		}).then(data => {
			if (data.err >= 0) {
				Modal.info({
					title: '测试信息',
					content: (
						<div>
							<p>计算结果为：{data.data}</p>
							<TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={data.debugInfo} />

						</div>
					)
				})
			} else {
				Modal.error({
					title: '错误提示',
					content: '通讯失败,请稍后再试'
				})
			}
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 4
			},
			wrapperCol: {
				span: 20
			},
		};

		return (
			<Modal
				className={modalToggleClass}
				title="编辑输出动作"
				width={680}
				visible={this.props.visible}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
                destroyOnClose={true} //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText="取消"
				okText="确定"
			>
				<div style={{ overflow: 'hidden' }}>
					<Button type="primary" onClick={this.handleHidePointModal}>插入点名</Button>
					<Button style={{ marginLeft: '10px' }} onClick={this.handlePdfModal}>帮我编制脚本</Button>
					<Button style={{ marginLeft: '10px' }} onClick={() => this.modifyPointDescription()}>测试脚本</Button>
					<Button style={{ float: 'right', marginRight: '10px' }} type="danger" onClick={this.handleDelete}>删除</Button>
				</div>
				<Form style={{ marginTop: '10px' }}>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="编辑脚本"
					>
						{getFieldDecorator('outputScript', {
							rules: [{
								required: true, message: '请编辑输出动作脚本!'
							}],
							initialValue: this.props.editOutputScript
						})(
							<TextArea
								autoSize={{ minRows: 2, maxRows: 10 }}
							/>
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="脚本释义"
						className={selectToggleClass}
					>
						{getFieldDecorator('scriptDesc', {
							initialValue: this.props.editOutputDesc
						})(
							<TextArea
								autoSize={{ minRows: 3, maxRows: 10 }}
							/>
						)}
					</FormItem>

				</Form>

			</Modal>
		);
	}
}
const WrappedEditOutputModal = Form.create(
)(EditOutputModal);

export default WrappedEditOutputModal
