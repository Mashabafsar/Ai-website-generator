import { motion } from "motion/react"
import Link from "next/link"
import { forwardRef } from "react"

const Component = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>((props, ref) => (
    <div ref={ref} />
))

export const MotionComponent = motion(Component)

export const MotionLink= motion(Link)

