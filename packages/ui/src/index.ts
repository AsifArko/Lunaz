/**
 * @lunaz/ui — Shared React components (Web + Manage).
 */

// Primitives
export { Button, type ButtonProps } from './Button/Button.js';
export { Input, type InputProps } from './Input/Input.js';
export { Select, type SelectProps, type SelectOption } from './Select/Select.js';
export { Checkbox, type CheckboxProps } from './Checkbox/Checkbox.js';
export { Label, type LabelProps } from './Label/Label.js';
export { Textarea, type TextareaProps } from './Textarea/Textarea.js';
export { Badge, type BadgeProps } from './Badge/Badge.js';
export { Spinner, type SpinnerProps } from './Spinner/Spinner.js';

// Layout
export { Card, type CardProps } from './Card/Card.js';
export { Container, type ContainerProps } from './Container/Container.js';
export { Stack, type StackProps } from './Stack/Stack.js';
export { Grid, type GridProps } from './Grid/Grid.js';
export { Divider, type DividerProps } from './Divider/Divider.js';
export { PageHeader, type PageHeaderProps } from './PageHeader/PageHeader.js';

// Feedback
export { Alert, type AlertProps } from './Alert/Alert.js';
export { Modal, type ModalProps } from './Modal/Modal.js';
export { Skeleton, SkeletonText, SkeletonCard, type SkeletonProps } from './Skeleton/Skeleton.js';

// Data display
export { Price, getProductPrice, type PriceProps } from './Price/Price.js';
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
} from './Table/Table.js';
export {
  Pagination,
  PaginationInfo,
  type PaginationProps,
  type PaginationInfoProps,
} from './Pagination/Pagination.js';
export { EmptyState, emptyStateIcons, type EmptyStateProps } from './EmptyState/EmptyState.js';

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
} from './Tabs/Tabs.js';
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHome,
  type BreadcrumbProps,
  type BreadcrumbItemProps,
  type BreadcrumbHomeProps,
} from './Breadcrumb/Breadcrumb.js';

// Theme
export * from './theme/index.js';
