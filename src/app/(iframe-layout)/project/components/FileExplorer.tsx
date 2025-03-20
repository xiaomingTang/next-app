import * as React from 'react'
import clsx from 'clsx'
import { styled, alpha, Box, Collapse, Typography } from '@mui/material'
import {
  treeItemClasses,
  TreeItem2DragAndDropOverlay,
  TreeItem2Icon,
  TreeItem2LabelInput,
  TreeItem2Provider,
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
  useTreeItem2,
  type UseTreeItem2Parameters,
  type TreeViewBaseItem,
} from '@mui/x-tree-view'

import type { SimpleProjectItem } from '../utils/arrayToTree'
import type { TransitionProps } from '@mui/material/transitions'

const StyledTreeItemLabelInput = styled(TreeItem2LabelInput)(({ theme }) => ({
  color: theme.palette.grey[400],
  fontWeight: 500,
  ...theme.applyStyles('light', {
    color: theme.palette.grey[800],
  }),
}))

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.grey[400],
  position: 'relative',
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: theme.spacing(3.5),
  },
  ...theme.applyStyles('light', {
    color: theme.palette.grey[800],
  }),
})) as unknown as typeof TreeItem2Root

const StyledTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  gap: theme.spacing(0.5),
  fontWeight: 500,
  [`&.Mui-expanded `]: {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon':
      {
        color: theme.palette.primary.dark,
        ...theme.applyStyles('light', {
          color: theme.palette.primary.main,
        }),
      },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor: theme.palette.grey[700],
      ...theme.applyStyles('light', {
        backgroundColor: theme.palette.grey[300],
      }),
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: 'white',
    ...theme.applyStyles('light', {
      color: theme.palette.primary.main,
    }),
  },
  [`&.Mui-selected`]: {
    backgroundColor: alpha(theme.palette.primary.dark, 0.5),
    color: theme.palette.primary.contrastText,
    ...theme.applyStyles('light', {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    }),
  },
  [`&.Mui-focused, &.Mui-selected.Mui-focused`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    ...theme.applyStyles('light', {
      backgroundColor: theme.palette.primary.main,
    }),
  },
}))

function TransitionCollapse(props: TransitionProps) {
  return (
    <Collapse
      sx={{
        paddingLeft: '16px',
        opacity: props.in ? 1 : 0,
        transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
        transition: 'opacity 0.2s, transform 0.2s',
      }}
      {...props}
    />
  )
}

const StyledTreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontWeight: 500,
})

interface CustomLabelProps {
  children: React.ReactNode
  icon?: React.ElementType
}

function CustomLabel({ icon: Icon, children, ...other }: CustomLabelProps) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'inherit',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className='labelIcon'
          color='inherit'
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      <StyledTreeItemLabelText variant='body2'>
        {children}
      </StyledTreeItemLabelText>
    </TreeItem2Label>
  )
}

interface FileExplorerTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

function RawFileExplorerTreeItem(
  props: FileExplorerTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getLabelInputProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    publicAPI,
    status: rawStatus,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref })

  const item: TreeViewBaseItem<SimpleProjectItem> = publicAPI.getItem(itemId)

  const status = React.useMemo(
    () => ({
      ...rawStatus,
      expandable: item.type === 'DIR',
    }),
    [item.type, rawStatus]
  )
  const isEmptyDir = status.expandable && !item.children?.length

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps(other)}>
        <StyledTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            }),
            status,
            onClick: (event) => {
              if (status.expandable && !status.disabled && !status.editing) {
                publicAPI.setItemExpansion(event, itemId, !status.expanded)
              }
            },
          })}
        >
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon
              status={status}
              slotProps={{
                collapseIcon: {
                  opacity: isEmptyDir ? 0.5 : 1,
                },
                expandIcon: {
                  opacity: isEmptyDir ? 0.5 : 1,
                },
              }}
            />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          {status.editing ? (
            <StyledTreeItemLabelInput {...getLabelInputProps()} />
          ) : (
            <CustomLabel {...getLabelProps()} />
          )}
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </StyledTreeItemContent>
        {children && <TransitionCollapse {...getGroupTransitionProps()} />}
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  )
}

export const FileExplorerTreeItem = React.forwardRef(RawFileExplorerTreeItem)
