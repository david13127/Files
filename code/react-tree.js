import React, { useEffect, useState, useRef } from 'react';//首先引入hooks常用方法
import { connect } from 'react-redux';
import { Tree } from 'antd';  //引入组件
import { DownOutlined } from '@ant-design/icons'; //引入图标
const myDemo=(props)=>{
  const treeData=[{
            title: 'parent 1',
            key: '0-0',
            children: [
                {
                    title: 'parent 1-0',
                    key: '0-0-0',
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-0-0',
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-1',
                        },
                        {
                            title: 'leaf',
                            key: '0-0-0-2',
                        },
                    ],
                },
                {
                    title: 'parent 1-1',
                    key: '0-0-1',
                    children: [
                        {
                            title: 'leaf',
                            key: '0-0-1-0',
                        },
                    ],
                },
            ],
  const onSelect=(selectedKeys, info)=>{
        console.log('selected', selectedKeys, info);
  }
  
  
  return (
   <div className="myDemo">
    <Tree
        showLine={true}   //是否开启节点之间带连接线的树  开启之后可以用 switcherIcon 修改默认图标
        switcherIcon={<DownOutlined />}  //默认图标
        defaultExpandedKeys={['0-0-0']}  //默认展开指定的树节点 key 
        onSelect={onSelect}  //点击树节点触发的回调
        treeData={treeData}
     />  
           
   </div>
  )
}
//暴露此组件
export default myDemo
注意点：传入的treeData中的key值要唯一，一般实际开发中后端从数据库拿的都是id，因此存在从多个库拿数据id相同的问题,此时需要加上—_或则- 拼接id 是比较好的方法

2、hooks改写官网的搜索树（官网demo是使用class的方式写的…）

index.jsx文件

import React, { useEffect, useState, useRef } from 'react';//首先引入hooks常用方法
import { connect } from 'react-redux';
import { Tree,Input } from 'antd';  //引入组件
const { Search } = Input;
const myDemo=(props)=>{
    const [treeData,setTreeData]=useState([]) //tree数据   这里数据接口获取 结构同上  就不再写了  后面直接用
    const [searchData, setsearchData] = useState('')  //搜索
    const [tree, setTree] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(false)
    const [expandedKeys, setExpandedKeys] = useState([])
    
    const searchValue = () => {  //点击搜索
      let value = searchData
      setAutoExpandParent(true)
      const expandedKey = getKey(value, tree)
      setExpandedKeys(expandedKey)
      setTreeData(fliterData(tree))
  }
  const updataSearch = (e) => { //更新input值
     setsearchData(e.target.value)
     if (e.target.value == '') {
        setTreeData(tree)
     }

   }
  const handelSelect = (selectedKeys, e) => { //点击 选中树节点 触发 
        const { title, key } = e.node
        console.log(title,key);
        //后面的业务逻辑根据实际情况来
        ...
        
  }
  const getParentKey = (key, tree) => { //传入当前节点key,返回父节点key 
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) { //如果没找到 继续向下匹配 递归调用  
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };
  const fliterData = data => data.map((item, i) => { //过滤数据 将input的搜索值 高亮显示
    const index = item.title.indexOf(searchData);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchData.length);
    const title =
      index > -1 ? (
        <span>
          {beforeStr}
          <span className="site-tree-search-value">{searchData}</span>
          {afterStr}
        </span>
      ) : (
        <span>{item.title}</span>
      );
    if (item.children) {
      return { title, key: item.key, children: fliterData(item.children) };
    }
    return {
      title,
      key: item.key,
    };
  })

  let keyArr2 = [] //存放匹配key 的数组
  //传入input value值 模糊搜索 匹配key值数组
  const getKey = (value, data) => {  
    data.map(item => {
      if (item.title.indexOf(value) > -1) {
        keyArr2.push(getParentKey(item.key, treeData))
      }
      if (item.children) {
        getKey(value, item.children)
      }
    })
    return keyArr2.filter((item, i, self) => item && self.indexOf(item) === i);
    //过滤数组中相同的key值

  }

  const onExpand = expandedKeys => {  //展开/收起节点时触发
    setExpandedKeys(expandedKeys)
    setAutoExpandParent(false)
  };
  
  //获取数据
   useEffect(() => {
        const createData = async () => {
        //这里的请求是自己封装的  按自己项目中的请求来
            const result = await ajax({ url: `/api/XXX`, data: { data_type: 1 } })
            setTreeData(result.node)
            setTree(result.node)
        }
        createData()

    }, [])
    return(
      <div className="myDemo">
       <Search
                placeholder="请输入内容"
                className="searchBox"
                value={searchData}
                onChange={updataSearch}
                onSearch={searchValue}
                size="middle"
                allowClear
              />
      <Tree
                showLine={{showLeafIcon: false}}
                showIcon
                className="datatree"
                autoExpandParent={autoExpandParent}  
                onSelect={handelSelect}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                treeData={treeData}
              />
      </div>
    )

}

//暴露此组件
export default myDemo