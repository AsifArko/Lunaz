/**
 * @lunaz/ui — Shared React components (Web + Manage).
 */

// Primitives
export { Button, type ButtonProps } from './Button/Button';
export { Input, type InputProps } from './Input/Input';
export { Select, type SelectProps, type SelectOption } from './Select/Select';
export { Checkbox, type CheckboxProps } from './Checkbox/Checkbox';
export { Label, type LabelProps } from './Label/Label';
export { Textarea, type TextareaProps } from './Textarea/Textarea';
export { Badge, type BadgeProps } from './Badge/Badge';
export { Spinner, type SpinnerProps } from './Spinner/Spinner';

// Layout
export { Card, type CardProps } from './Card/Card';
export { Container, type ContainerProps } from './Container/Container';
export { Stack, type StackProps } from './Stack/Stack';
export { Grid, type GridProps } from './Grid/Grid';
export { Divider, type DividerProps } from './Divider/Divider';
export { PageHeader, type PageHeaderProps } from './PageHeader/PageHeader';

// Feedback
export { Alert, type AlertProps } from './Alert/Alert';
export { Modal, type ModalProps } from './Modal/Modal';
export { Skeleton, SkeletonText, SkeletonCard, type SkeletonProps } from './Skeleton/Skeleton';

// Data display
export { Price, getProductPrice, type PriceProps } from './Price/Price';
export {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardProps,
  type ProductCardProduct,
} from './ProductCard/ProductCard';
export {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  type TableProps,
  type TableHeadProps,
  type TableBodyProps,
  type TableRowProps,
  type TableHeaderCellProps,
  type TableCellProps,
} from './Table/Table';
export {
  Pagination,
  PaginationInfo,
  type PaginationProps,
  type PaginationInfoProps,
} from './Pagination/Pagination';
export { EmptyState, emptyStateIcons, type EmptyStateProps } from './EmptyState/EmptyState';

// Navigation
export {
  Tabs,
  TabsList,
  Tab,
  TabsPanel,
  type TabsProps,
  type TabsListProps,
  type TabProps,
  type TabsPanelProps,
} from './Tabs/Tabs';
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHome,
  type BreadcrumbProps,
  type BreadcrumbItemProps,
  type BreadcrumbHomeProps,
} from './Breadcrumb/Breadcrumb';

// Theme
export * from './theme/index';
