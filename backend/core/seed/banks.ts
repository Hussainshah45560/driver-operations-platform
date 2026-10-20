import { ObjectId } from "mongodb";
import { Bank } from "../../models";

export const banks: Bank[] = [
  { _id: new ObjectId("69837b397486ddf5950f5a82"), name: "Absa Bank", code:"632005" },
  { _id: new ObjectId("69837b397486ddf5950f5a83"), name: "African Bank", code:"430000" },
  { _id: new ObjectId("69837b397486ddf5950f5a84"), name: "Bidvest Bank", code:"462005" },   
  { _id: new ObjectId("69837b397486ddf5950f5a85"), name: "Capitec Bank", code:"470010" },
  { _id: new ObjectId("69837b397486ddf5950f5a86"), name: "Discovery Bank", code:"679000" },
  { _id: new ObjectId("69837b397486ddf5950f5a87"), name: "First National Bank (FNB)", code:"250655" },   
  { _id: new ObjectId("69837b397486ddf5950f5a88"), name: "First Rand Bank", code:"201419" },
  { _id: new ObjectId("69837b397486ddf5950f5a89"), name: "Investec Bank", code:"580105" },
  { _id: new ObjectId("69837b397486ddf5950f5a90"), name: "Mercantile Bank", code:"450905" },   
  { _id: new ObjectId("69837b397486ddf5950f5a91"), name: "Ned Bank", code:"198765" },
  { _id: new ObjectId("69837b397486ddf5950f5a92"), name: "Post Bank", code:"460005" },
  { _id: new ObjectId("69837b397486ddf5950f5a93"), name: "Sasfin Bank", code:"683000" },   
  { _id: new ObjectId("69837b397486ddf5950f5a99"), name: "Standard Bank", code:"051001" },
  { _id: new ObjectId("69837b397486ddf5950f5a9a"), name: "Tyme Bank", code:"678910" },
  { _id: new ObjectId("69837b397486ddf5950f5a9b"), name: "Access Bank", code:"410506" },   
  { _id: new ObjectId("69837b397486ddf5950f5a9c"), name: "Mukuru Bank)", code:"410506" },
  { _id: new ObjectId("69837b397486ddf5950f5a9d"), name: "Hello Paisa - FNB", code:"250655" },
  { _id: new ObjectId("69837b397486ddf5950f5a9e"), name: "Hello Paisa - Standard Bank", code:"051001" },
  { _id: new ObjectId("69837b397486ddf5950f5aaf"), name: "Hello Paisa - Ned Bank", code:"198765" },
 
];
