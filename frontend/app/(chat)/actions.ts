'use server';

import { MAIN_URL } from '@/lib/utils';
import { cookies } from 'next/headers';

export const createChat =async()=>{
    console.log(MAIN_URL)
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

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}