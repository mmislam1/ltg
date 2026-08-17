import React from 'react'
import Meals from '../components/meals'
import StepCounter from '../components/stepCounter'
import Water from '../components/water'
import PageSuspense from '../components/pageSuspense'
import { ComponentSuspenseFallback } from '../components/suspenseFallback'

const AddMealPage = () => {
  return (
    <PageSuspense>
      <div className='mx-auto my-6 flex w-full max-w-xl flex-col gap-4 px-2 sm:px-4'>
        <React.Suspense fallback={<ComponentSuspenseFallback label="Loading meals" />}>
          <Meals />
        </React.Suspense>
        <section id="water" className="scroll-mt-24">
          <React.Suspense fallback={<ComponentSuspenseFallback label="Loading water" />}>
            <Water />
          </React.Suspense>
        </section>
        <section id="steps" className="scroll-mt-24">
          <React.Suspense fallback={<ComponentSuspenseFallback label="Loading steps" />}>
            <StepCounter />
          </React.Suspense>
        </section>
      </div>
    </PageSuspense>
  )
}

export default AddMealPage
