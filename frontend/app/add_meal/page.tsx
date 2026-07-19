import React from 'react'
import Meals from '../components/meals'
import StepCounter from '../components/stepCounter'
import Water from '../components/water'

const AddMealPage = () => {
  return (
    <div className='mx-auto my-6 flex w-full max-w-xl flex-col gap-4 px-2 sm:px-4'>
      <Meals/>
      <section id="water" className="scroll-mt-24">
        <Water />
      </section>
      <section id="steps" className="scroll-mt-24">
        <StepCounter />
      </section>
    </div>
  )
}

export default AddMealPage
