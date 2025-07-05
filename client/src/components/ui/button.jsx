import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"
import { Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline active:scale-95",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md active:scale-95",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm hover:shadow-md active:scale-95",
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-95",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md active:scale-95",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-sm hover:shadow-md active:scale-95",
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
      fullWidth: false,
      rounded: "default",
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false,
  loadingText = "Loading...",
  icon,
  iconPosition = "left",
  iconSize = "default",
  fullWidth = false,
  rounded = "default",
  tooltip,
  confirm,
  confirmText = "Are you sure?",
  onConfirm,
  children,
  disabled,
  ...props 
}, ref) => {
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(loading)

  // Handle loading state changes
  React.useEffect(() => {
    setIsLoading(loading)
  }, [loading])

  // Handle confirmation
  const handleClick = async (e) => {
    if (confirm && !showConfirm) {
      e.preventDefault()
      setShowConfirm(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }

    if (onConfirm && showConfirm) {
      setIsLoading(true)
      try {
        await onConfirm()
      } finally {
        setIsLoading(false)
        setShowConfirm(false)
      }
    }

    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e)
    }
  }

  // Get icon size class
  const getIconSizeClass = () => {
    switch (iconSize) {
      case "sm": return "h-3 w-3"
      case "lg": return "h-5 w-5"
      default: return "h-4 w-4"
    }
  }

  // Get loading icon size class
  const getLoadingIconSizeClass = () => {
    switch (size) {
      case "sm": return "h-3 w-3"
      case "lg":
      case "xl": return "h-5 w-5"
      default: return "h-4 w-4"
    }
  }

  const Comp = asChild ? Slot : "button"

  const buttonContent = (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Loader2 className={cn("animate-spin", getLoadingIconSizeClass())} />
        </div>
      )}

      {/* Button content */}
      <div className={cn("flex items-center justify-center", isLoading && "opacity-0")}>
        {/* Left icon */}
        {icon && iconPosition === "left" && !isLoading && (
          <span className={cn("mr-2", getIconSizeClass())}>
            {React.isValidElement(icon) ? icon : React.createElement(icon)}
          </span>
        )}

        {/* Loading icon (left position) */}
        {isLoading && iconPosition === "left" && (
          <Loader2 className={cn("mr-2 animate-spin", getLoadingIconSizeClass())} />
        )}

        {/* Text content */}
        <span>
          {showConfirm ? confirmText : (isLoading ? loadingText : children)}
        </span>

        {/* Right icon */}
        {icon && iconPosition === "right" && !isLoading && (
          <span className={cn("ml-2", getIconSizeClass())}>
            {React.isValidElement(icon) ? icon : React.createElement(icon)}
          </span>
        )}

        {/* Loading icon (right position) */}
        {isLoading && iconPosition === "right" && (
          <Loader2 className={cn("ml-2 animate-spin", getLoadingIconSizeClass())} />
        )}
      </div>

      {/* Confirmation indicator */}
      {showConfirm && (
        <div className="absolute inset-0 bg-yellow-500/20 border-2 border-yellow-500 rounded-inherit animate-pulse" />
      )}
    </>
  )

  return (
    <Comp
      className={cn(
        buttonVariants({ 
          variant, 
          size, 
          loading: isLoading, 
          fullWidth, 
          rounded, 
          className 
        }),
        tooltip && "relative"
      )}
      ref={ref}
      disabled={disabled || isLoading}
      onClick={handleClick}
      title={tooltip}
      {...props}
    >
      {buttonContent}
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </Comp>
  )
})

Button.displayName = "Button"

// Convenience components for common button types
const IconButton = React.forwardRef(({ icon, size = "icon", ...props }, ref) => (
  <Button ref={ref} size={size} icon={icon} {...props} />
))
IconButton.displayName = "IconButton"

const LoadingButton = React.forwardRef(({ loading = true, ...props }, ref) => (
  <Button ref={ref} loading={loading} {...props} />
))
LoadingButton.displayName = "LoadingButton"

const ConfirmButton = React.forwardRef(({ confirm = true, ...props }, ref) => (
  <Button ref={ref} confirm={confirm} {...props} />
))
ConfirmButton.displayName = "ConfirmButton"

// Status button variants
const SuccessButton = React.forwardRef(({ icon = CheckCircle, ...props }, ref) => (
  <Button ref={ref} variant="success" icon={icon} {...props} />
))
SuccessButton.displayName = "SuccessButton"

const WarningButton = React.forwardRef(({ icon = AlertTriangle, ...props }, ref) => (
  <Button ref={ref} variant="warning" icon={icon} {...props} />
))
WarningButton.displayName = "WarningButton"

const InfoButton = React.forwardRef(({ icon = Info, ...props }, ref) => (
  <Button ref={ref} variant="info" icon={icon} {...props} />
))
InfoButton.displayName = "InfoButton"

export { 
  Button, 
  buttonVariants, 
  IconButton, 
  LoadingButton, 
  ConfirmButton,
  SuccessButton,
  WarningButton,
  InfoButton
} 