// Live camera only: no file picker, no gallery. The photo is captured from the video stream.
import { useState, useRef, useEffect } from 'react'

function CameraCapture({ onCapture }) {
    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const [cameraOn, setCameraOn] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [error, setError] = useState('')

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setCameraOn(false)
    }

    // Turn the camera off if the modal closes
    useEffect(() => () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
    }, [])

    // Attach the stream once the <video> element exists
    useEffect(() => {
        if (cameraOn && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [cameraOn])

    const startCamera = async () => {
        setError('')
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Camera is not available here (needs localhost or HTTPS)')
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            })
            streamRef.current = stream
            setCameraOn(true)
        } catch {
            setError('Camera permission denied or no camera found')
        }
    }

    const capture = () => {
        const video = videoRef.current
        if (!video || !video.videoWidth) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setPreviewUrl(URL.createObjectURL(file))
            onCapture(file)
            stopCamera()
        }, 'image/jpeg', 0.85)
    }

    const retake = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        onCapture(null)
        startCamera()
    }

    return (
        <div>
            {error && <div style={s.error}>{error}</div>}

            {previewUrl ? (
                <div>
                    <img src={previewUrl} alt="Captured" style={s.media} />
                    <button type="button" style={s.secondaryBtn} onClick={retake}>Retake</button>
                </div>
            ) : cameraOn ? (
                <div>
                    <video ref={videoRef} autoPlay playsInline muted style={s.media} />
                    <div style={s.row}>
                        <button type="button" style={s.primaryBtn} onClick={capture}>Capture</button>
                        <button type="button" style={s.secondaryBtn} onClick={stopCamera}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button type="button" style={s.primaryBtn} onClick={startCamera}>Open Camera</button>
            )}
        </div>
    )
}

const s = {
    media: { width: '100%', borderRadius: '8px', background: '#000', display: 'block', marginBottom: '0.5rem' },
    row: { display: 'flex', gap: '0.5rem' },
    primaryBtn: { padding: '0.55rem 1.1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    secondaryBtn: { padding: '0.55rem 1.1rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    error: { background: '#fee2e2', color: '#991b1b', padding: '0.5rem 0.8rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.8rem' },
}

export default CameraCapture