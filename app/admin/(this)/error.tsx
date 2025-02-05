'use client';
import { useEffect } from 'react'
import { Button } from 'antd'

export default function Error(p: {
  error: Error
  reset: () => void
}) {

  useEffect(() => {
    console.error(p.error)
  }, [p.error])

  return (
    <div className='p-4'>
      <div className='py-4'>很抱歉，网络异常</div>
      <Button
        onClick={() => {
          p.reset()
          location.reload()
        }}
      >
        重连
      </Button>
    </div>
  );

}