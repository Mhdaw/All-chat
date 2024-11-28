'use server';

import { MAIN_URL } from '@/lib/utils';


export const createChat =async()=>{
    const data = await fetch(`${MAIN_URL}/create_chat`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
    })
   try {
    console.log(data);
    
    return data.json();
   } catch (error) {
    console.log(error);
    
   }
}