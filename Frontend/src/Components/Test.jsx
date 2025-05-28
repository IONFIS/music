import React, { useEffect, useState } from 'react'

const Test = () => {
  const [data,setData]=useState();
  useEffect(()=>{
    fetch("https://jsonplaceholder.typicode.com/posts").
    then((response)=response.json())
    .then((json)=>setData(json))

    return ()=> console.log("cleanup when mounted");
  },[]);
   return <div>{data.length} items loaded</div>;
 
}

export default Test