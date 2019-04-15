var pieDataList = [ {
	id : 1,
	area_name : "广东省",
	area_data : [ {
		value : 335,
		name : '直接访问'
	}, {
		value : 310,
		name : '邮件营销'
	}, {
		value : 234,
		name : '联盟广告'
	}, {
		value : 135,
		name : '视频广告'
	}, {
		value : 1548,
		name : '搜索引擎'
	} ],
	coordinates : [ 113.307649675, 23.1200491021 ]
}, {
	id : 2,
	area_name : "福建省",
	area_data : [ {
		value : 100,
		name : '直接访问'
	}, {
		value : 410,
		name : '邮件营销'
	}, {
		value : 334,
		name : '联盟广告'
	}, {
		value : 635,
		name : '视频广告'
	}, {
		value : 800,
		name : '搜索引擎'
	} ],
	coordinates : [ 119.330221107, 26.0471254966 ]
} ];

var pieData = [ {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "个体工商户",
	value : 60,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "内资企业",
	value : 46,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "农民专业合作社",
	value : 90,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "外商投资企业",
	value : 85,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "自然人",
	value : 63,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "个体工商户",
	value : 67,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "内资企业",
	value : 99,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "农民专业合作社",
	value : 22,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "外商投资企业",
	value : 87,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "自然人",
	value : 94,
	x_name : "企业类型总数"
} ];

var barData = [ {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "个体工商户",
	value : 60,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "内资企业",
	value : 46,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "农民专业合作社",
	value : 90,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "外商投资企业",
	value : 85,
	x_name : "企业类型总数"
}, {
	areacode : "1",
	id : "1",
	areaname : "广东",
	coordinates : [ 113.307649675, 23.1200491021 ],
	unit : "件",
	name : "自然人",
	value : 63,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "个体工商户",
	value : 67,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "内资企业",
	value : 99,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "农民专业合作社",
	value : 22,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "外商投资企业",
	value : 87,
	x_name : "企业类型总数"
}, {
	areacode : "2",
	areaname : "福建",
	coordinates : [ 119.330221107, 26.0471254966 ],
	unit : "件",
	name : "自然人",
	value : 94,
	x_name : "企业类型总数"
} ];