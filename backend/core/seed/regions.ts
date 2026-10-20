import { ObjectId } from "mongodb";
import { Region } from "../../models";

export const regions: Region[] = [
  {
    _id: new ObjectId("691f5b86123d03c8fc0695ef"),
    name: 'Gauteng',

  },
   {
    _id: new ObjectId("691f5b86123d03c8fc0695f0"),
    name: 'KwaZulu-Natal',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f1"),
    name: 'Western Cape',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f2"),
    name: 'Eastern Cape',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f3"),
    name: 'Northern Cape',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f4"),
    name: 'Free State',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f5"),
    name: 'Limpopo',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f6"),
    name: 'Mpumalanga',

  }, {
    _id: new ObjectId("691f5b86123d03c8fc0695f7"),
    name: 'North West',

  },
]