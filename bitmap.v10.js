"use strict" ; ( ( ) => {

/* Copyright 2019 南织( yangx14488@foxmail.com )

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and limitations under the License.

*/

/* 版权所有 2019 南织( yangx14488@foxmail.com )

    根据Apache许可证2.0版（“许可证”）获得许可;
    除非符合许可，否则您不得使用此文件。
    您可以从

        http://www.apache.org/licenses/LICENSE-2.0 获取许可证副本。

    除非适用法律要求或书面同意，否则根据许可证分发的软件将按“原样”分发，
    不附带任何明示或暗示的保证或条件。
    有关管理许可下的权限和限制的特定语言，请参阅许可证。

*/

const $f = new Object ;

$f.get = ( n, a, l ) => {
  let q , // 商数( 去尾 )
        r , // 余数
        p , // 片段
        c , // 指针
        t ;
  if ( l ) {
    t = 1 ;
  } else {
    if ( typeof n === "number" ) {
      q = Math.floor( n / 32 ) ;
      r = n % 32 ;
      p = a[ q ] ; // 指向商所在的值
      if ( typeof p === "number" ) {
        c = 1 << r ; // 指向
        t = !!( p & c ) ; // 判定
      } else { // 很明显地图还没加载到这个值，索性就返回 false 了
        t = false ;
      } ;
    } else {
      t = 0 ;
    } ;
  } ;
  return t ;
} ;
$f.set = ( n, a, l, v ) => {
  let q , // 商数( 去尾 )
        r , // 余数
        c , // 指针
        t ; // 返回
  if ( l ) {
    t = 1 ;
  } else {
    if ( typeof n === "number" ) {
      if ( typeof v === "boolean" ) {
        q = Math.floor( n / 32 ) ;
        r = n % 32 ;
        c = 1 << r ;
        if ( typeof a[ q ] !== "number" ) a[ q ] = 0 ; // 初始化值
        /* 存储 输入 输出
          0     0      0  与
          1     0      0  与
          0     1      1   或
          1     1      1   或
          101001 $ 001000 => 100001 与, 非
          101001 $ 000100 => 101001 与, 非
        */
        if ( v ) {
          a[ q ] |= c ; // 或
        } else {
          !!( a[ q ] & c ) && ( a[ q ] ^= c ) ; // 与非
        } ;
        t = v ;
      } else {
        t = $f.get( n, a, l ) ;
      }
    } else {
      t = 0 ;
    } ;
  } ;
  return t ;
} ;
$f.export = a => {
  let r ,
        i ,
        h ;
  r = "" ;
  for ( i of a ) {
    if ( typeof i === "number" ) {
      h = i.toString( 16 ) ; // 转为16进制
      if ( !h.indexOf( "-" ) ) h = h.substring( 1, h.length ) ;
      while ( h.length < 8 ) h = "0" + h ;
      r += h ;
    } else {
      r += "00000000" ;
    }
  } ;
  return r ;
} ;
$f.import = ( a, h ) => {
  let r ,
        i ,
        p ,
        b ;
  if ( typeof h === "string" && h.length > 0 && !( h % 8 ) && !/[^0-9a-f]/.test( h ) ) {
    r = true ;
    i = 0 ;
    p = 0 ;
    while ( p < h.length - 8 ) {
      p = i * 8 ;
      b = parseInt( h.substring( p, p + 8 ), 16 ).toString( 2 ) ;
      while ( b.length < 32 ) b = "0" + b ;
      a[ i++ ] = parseInt( !b.indexOf( "1" ) ? `-${ b }` : b , 2 ) ;
    } ;
  } else {
    r = false ;
  } ;
  return r ;
} ;

$f.bitmap = class {
  constructor( ){
    this.map = new Array ; // 地图
    this.lock = false ; // 地图锁
  } ;
  /* f值( n.位置[, b.值 ] ) ;
      ret n.0 : 参数错误
            n.1 : 地图可能在执行导出/导入操作
            b.true || b.false : 获取到的值 / 设置的值( 设置的值等于返回值 )
  */
  value( num, type ){ // 0 : 参数不对, 1 : 地图锁, 传入的 type 为布尔值时，将设置地图上的 num
    return $f.set( num, this.map, this.lock, type ) ;
  } ;
  // 考虑到性能问题，这是个异步函数
  export( ){ // 导出地图
    return new Promise( _res => {
      let data ;
      this.lock = true ;
      data = $f.export( this.map ) ;
      this.lock = false ;
      _res( data ) ;
    } ) ;
  } ;
  // 考虑到性能问题，这还是个异步函数，对了，没事别导入导出玩，卡不死你... id最大不要超过100000了
  import( hex ){ // 导入地图
    return new Promise( _res => {
      let data ;
      this.lock = true ;
      data = $f.import( this.map, hex ) ;
      this.lock = false ;
      _res( data ) ;
    } ) ;
  } ;
} ;

module.exports = $f.bitmap ; // new以建立一张新的比特地图

} )( ) ;
