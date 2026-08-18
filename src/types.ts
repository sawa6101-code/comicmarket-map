export type CircleStatus = "UNVISITED" | "COMPLETED" | "SOLD_OUT";
export interface CircleData { id:string; space:string; name:string; status:CircleStatus; x:number; y:number; }