import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle as SvgCircle, Text as SvgText } from "react-native-svg";
import { CircleData, CircleStatus } from "../types";
interface Props { circles: CircleData[]; selectedId: string | null; mapUrl: string; onSelectCircle: (id:string)=>void; onMapTap:(x:number,y:number)=>void; }
const color=(s:CircleStatus)=>s==="COMPLETED"?"#22C55E":s==="SOLD_OUT"?"#F59E0B":"#EF4444";
export const InteractiveSvgMap:React.FC<Props>=({circles,selectedId,mapUrl,onSelectCircle,onMapTap})=>{
 const onPress=(e:any)=>{const {locationX,locationY}=e.nativeEvent; const target=e.currentTarget as any; const width=target?.offsetWidth||1000; const height=target?.offsetHeight||650; onMapTap(Math.max(0,Math.min(1000,locationX/width*1000)),Math.max(0,Math.min(650,locationY/height*650)));};
 return <View style={styles.container} onStartShouldSetResponder={()=>true} onResponderRelease={onPress}>
  {mapUrl?<Image source={{uri:mapUrl}} style={styles.mapImage} resizeMode="contain"/>:<View style={styles.placeholder}><Text style={styles.placeholderTitle}>公式白地図を設定してください</Text><Text style={styles.placeholderText}>C108公式サークルスペース地図の画像URLを登録すると、その画像の上にピンを配置できます。</Text></View>}
  <Svg pointerEvents="none" viewBox="0 0 1000 650" style={StyleSheet.absoluteFillObject}>{circles.map(c=><React.Fragment key={c.id}><SvgCircle cx={c.x} cy={c.y} r={selectedId===c.id?25:18} fill={color(c.status)} stroke={selectedId===c.id?"#111827":"#fff"} strokeWidth={selectedId===c.id?6:3}/><SvgText x={c.x+22} y={c.y+6} fontSize="16" fill="#111827">{c.space}</SvgText></React.Fragment>)}</Svg>
 </View>;
};
const styles=StyleSheet.create({container:{width:"100%",aspectRatio:1000/650,minHeight:360,backgroundColor:"#fff",borderRadius:16,overflow:"hidden",position:"relative"},mapImage:{...StyleSheet.absoluteFillObject,width:"100%",height:"100%"},placeholder:{flex:1,justifyContent:"center",alignItems:"center",padding:30,backgroundColor:"#F8FAFC"},placeholderTitle:{fontSize:20,fontWeight:"800",color:"#334155",textAlign:"center"},placeholderText:{marginTop:8,color:"#64748B",textAlign:"center",maxWidth:600}});