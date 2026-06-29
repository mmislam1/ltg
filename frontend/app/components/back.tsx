'use client'
import Button from '@/components/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'

const Back = () => {
    const router=useRouter()
  return (
      <button className='flex items-center justify-center p-2' onClick={() => router.back()}>
        <ArrowLeft></ArrowLeft>
    </button>
  )
}

export default Back