/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react'

function App() {
  // eslint-disable-next-line no-unused-vars
  const [isLoading] = useState(true)
  const [detections, setDetections] = useState([])
  const [showFaceDetectionMessage, setShowFaceDetectionMessage] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
        videoRef.current.srcObject = stream
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    startVideo()

    const handleDetections = async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const detectedFaces = detectFaces(imageData.data, canvas.width, canvas.height)
      setDetections(detectedFaces)

      if (detectedFaces.length > 0) {
        setShowFaceDetectionMessage(true)
      } else {
        setShowFaceDetectionMessage(false)
      }

      requestAnimationFrame(handleDetections)
    }

    videoRef.current.addEventListener('canplaythrough', handleDetections)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      videoRef.current.removeEventListener('canplaythrough', handleDetections)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    detections.forEach((detection) => {
      const { x, y, width, height } = detection
      context.beginPath()
      context.rect(x, y, width, height)
      context.strokeStyle = 'lime'
      context.lineWidth = 4
      context.stroke()
    })
  }, [detections])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Face Detection</h1>
      <div className="relative w-full max-w-[640px] h-auto rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto"
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      {showFaceDetectionMessage && (
        <div className="mt-8 p-4 bg-green-500 text-white rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-2">Faces Detected!</h2>
          <p className="text-lg">Your face(s) have been successfully detected.</p>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Home Features</h2>
        <ul className="list-disc ml-6 text-lg">
          <li>Face Detection</li>
          <li>Real-time Video Streaming</li>
          <li>Responsive and Mobile-friendly Design</li>
          <li>Intuitive User Interface</li>
        </ul>
      </div>
    </div>
  )
}

function detectFaces(imageData, width, _height) {
  const detectedFaces = []
  const data = new Uint8ClampedArray(imageData)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (r > 100 && g > 100 && b > 100) {
      const x = (i / 4) % width
      const y = Math.floor((i / 4) / width)
      detectedFaces.push({ x, y, width: 50, height: 50 })
    }
  }

  return detectedFaces
}

export default App