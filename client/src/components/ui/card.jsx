import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  ExternalLink,
  Star,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from 'lucide-react';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-sm hover:shadow-md',
        elevated: 'shadow-md hover:shadow-lg',
        outline: 'border-2 shadow-none hover:shadow-sm',
        ghost:
          'border-transparent bg-transparent shadow-none hover:bg-muted/50',
        gradient:
          'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md',
        glass:
          'bg-white/10 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md',
        success: 'border-green-200 bg-green-50/50 shadow-sm hover:shadow-md',
        warning: 'border-yellow-200 bg-yellow-50/50 shadow-sm hover:shadow-md',
        error: 'border-red-200 bg-red-50/50 shadow-sm hover:shadow-md',
        info: 'border-blue-200 bg-blue-50/50 shadow-sm hover:shadow-md',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      loading: {
        true: 'pointer-events-none opacity-75',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
      loading: false,
      fullWidth: false,
      padding: 'default',
    },
  }
);

const Card = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      interactive = false,
      loading = false,
      fullWidth = false,
      padding = 'default',
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            interactive,
            loading,
            fullWidth,
            padding,
            className,
          }),
          interactive && 'group'
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef(
  (
    { className, badge, badgeVariant = 'default', actions, children, ...props },
    ref
  ) => {
    const getBadgeColor = () => {
      switch (badgeVariant) {
        case 'success':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'error':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'info':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
          return 'bg-muted text-muted-foreground border-border';
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      >
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            {badge && (
              <div
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-2',
                  getBadgeColor()
                )}
              >
                {badge}
              </div>
            )}
            {children}
          </div>
          {actions && (
            <div className='flex items-center space-x-1 ml-4'>{actions}</div>
          )}
        </div>
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(
  ({ className, as: Component = 'h3', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight group-hover:text-primary transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

// Specialized card components
const InteractiveCard = React.forwardRef(
  ({ children, onClick, ...props }, ref) => (
    <Card ref={ref} interactive onClick={onClick} {...props}>
      {children}
    </Card>
  )
);
InteractiveCard.displayName = 'InteractiveCard';

const LoadingCard = React.forwardRef(
  ({ children, loading = true, ...props }, ref) => (
    <Card ref={ref} loading={loading} {...props}>
      {children}
    </Card>
  )
);
LoadingCard.displayName = 'LoadingCard';

const StatusCard = React.forwardRef(
  ({ status = 'default', icon, children, ...props }, ref) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'success':
          return {
            variant: 'success',
            icon: CheckCircle,
            color: 'text-green-600',
          };
        case 'warning':
          return {
            variant: 'warning',
            icon: AlertTriangle,
            color: 'text-yellow-600',
          };
        case 'error':
          return {
            variant: 'error',
            icon: AlertTriangle,
            color: 'text-red-600',
          };
        case 'info':
          return {
            variant: 'info',
            icon: Info,
            color: 'text-blue-600',
          };
        default:
          return {
            variant: 'default',
            icon: null,
            color: 'text-muted-foreground',
          };
      }
    };

    const config = getStatusConfig();
    const IconComponent = icon || config.icon;

    return (
      <Card ref={ref} variant={config.variant} {...props}>
        {IconComponent && (
          <div className={cn('flex items-center space-x-2 mb-2', config.color)}>
            <IconComponent className='h-5 w-5' />
            <span className='text-sm font-medium capitalize'>{status}</span>
          </div>
        )}
        {children}
      </Card>
    );
  }
);
StatusCard.displayName = 'StatusCard';

const MetricCard = React.forwardRef(
  (
    {
      title,
      value,
      change,
      changeType = 'neutral',
      icon,
      trend,
      children,
      ...props
    },
    ref
  ) => {
    const getChangeColor = () => {
      switch (changeType) {
        case 'positive':
          return 'text-green-600';
        case 'negative':
          return 'text-red-600';
        default:
          return 'text-muted-foreground';
      }
    };

    const getTrendIcon = () => {
      if (trend === 'up') return TrendingUp;
      if (trend === 'down') return TrendingDown;
      return null;
    };

    const TrendIcon = getTrendIcon();

    return (
      <Card ref={ref} {...props}>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              {icon && <div className='text-muted-foreground'>{icon}</div>}
              <CardTitle className='text-lg'>{title}</CardTitle>
            </div>
            {TrendIcon && (
              <TrendIcon className={cn('h-4 w-4', getChangeColor())} />
            )}
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex items-baseline space-x-2'>
            <span className='text-3xl font-bold'>{value}</span>
            {change && (
              <span className={cn('text-sm font-medium', getChangeColor())}>
                {change}
              </span>
            )}
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = 'MetricCard';

const ActionCard = React.forwardRef(
  (
    {
      title,
      description,
      primaryAction,
      secondaryAction,
      icon,
      children,
      ...props
    },
    ref
  ) => (
    <Card ref={ref} interactive {...props}>
      <CardHeader>
        <div className='flex items-start space-x-3'>
          {icon && <div className='flex-shrink-0 text-primary'>{icon}</div>}
          <div className='flex-1'>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {(primaryAction || secondaryAction) && (
        <CardFooter>
          <div className='flex items-center space-x-2 w-full'>
            {secondaryAction && <div className='flex-1'>{secondaryAction}</div>}
            {primaryAction && (
              <div className='flex-shrink-0'>{primaryAction}</div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
);
ActionCard.displayName = 'ActionCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  InteractiveCard,
  LoadingCard,
  StatusCard,
  MetricCard,
  ActionCard,
  cardVariants,
};
