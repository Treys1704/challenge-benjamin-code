import {useState, useRef, useEffect, useCallback} from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AccordionItem {
    id: number
    title: string
    description: string
    videoUrl: string
}

const items: AccordionItem[] = [
    {
        id: 1,
        title: "First, check your competitors",
        description:
            "Locate fellow YouTubers or competitors who are likely collaborating with sponsors that might interest you.",
        videoUrl: "/video1.mp4",
    },
    {
        id: 2,
        title: "Discover Their Sponsors",
        description: "Analyze the sponsorship patterns and identify potential collaboration opportunities.",
        videoUrl: "/video2.mp4",
    },
    {
        id: 3,
        title: "Check if a new sponsor could be a good fit",
        description:
            "By clicking on a sponsor, you can see many information about the sponsor and the kind of YouTubers they work with. Save it to your favorites to keep track of it.",
        videoUrl: "/video3.mp4",
    },
    {
        id: 4,
        title: "Check the YouTubers you do not know",
        description: "Explore new content creators and their sponsorship strategies.",
        videoUrl: "/video4.mp4",
    },
]

export default function VideoAccordion() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isVideoReady, setIsVideoReady] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const progressInterval = useRef<number | undefined>()

    const updateProgress = () => {
        if (videoRef.current) {
            const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(percentage)
        }
    }

    const handleVideoEnded = useCallback(() => {
        const nextIndex = (activeIndex + 1) % items.length
        setActiveIndex(nextIndex)
    }, [activeIndex])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        setIsVideoReady(false)
        setProgress(0)

        const handleCanPlay = () => {
            setIsVideoReady(true)
            video.play().catch((error) => {
                console.error("Error playing video:", error)
            })
        }

        // Clear existing progress interval
        if (progressInterval.current) {
            clearInterval(progressInterval.current)
        }

        // Setup video event listeners
        video.addEventListener("canplay", handleCanPlay)
        video.addEventListener("ended", handleVideoEnded)

        // Setup progress tracking
        progressInterval.current = setInterval(updateProgress, 100)

        // Cleanup function
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current)
            }
            video.removeEventListener("canplay", handleCanPlay)
            video.removeEventListener("ended", handleVideoEnded)
        }
    }, [activeIndex, handleVideoEnded])

    return (
        <div className="max-w-6xl mx-auto p-6 sm:p-8 grid lg:grid-cols-2 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={false}
                        onClick={() => setActiveIndex(index)}
                        className={`cursor-pointer rounded-lg p-4 ${(activeIndex === index) && "bg-slate-100/80"}`}
                    >
                        <div className={`flex items-start gap-4 ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`}>
                            <div
                                className={`w-6 h-6 rounded flex items-center text-sm justify-center flex-shrink-0 ${
                                    activeIndex === index ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                {item.id}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-xl text-gray-700 font-medium`}>{item.title}</h3>
                                <AnimatePresence mode="wait">
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-gray-600 mt-2">{item.description}</p>
                                            <div className="h-1 bg-gray-200 mt-4 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-black"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.1 }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="relative aspect-video bg-slate-100/80 rounded-lg border border-gray-400/30 overflow-hidden">
                <video
                    ref={videoRef}
                    key={items[activeIndex].videoUrl}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isVideoReady ? "opacity-100" : "opacity-0"
                    }`}
                    muted
                    playsInline
                >
                    <source src={items[activeIndex].videoUrl} type="video/mp4" />
                </video>
            </div>
        </div>
    )
}

