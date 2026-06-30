'use client'
import Button from '@/components/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'

const Back = () => {
    const router=useRouter()
  return (
      <button type="button" className="btn btn-ghost btn-icon" onClick={() => router.back()} aria-label="Go back">
        <ArrowLeft></ArrowLeft>
    </button>
  )
}

export default Back
