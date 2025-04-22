import { Table2, Layout, PanelTop, Sparkles, FormInput, MousePointer } from 'lucide-svelte';

const componentCategories = [
	{
		name: 'Layout',
		icon: Layout,
		components: [
			{
				name: 'Accordion',
				link: '/components/accordion',
				description: 'A vertically stacked set of interactive headings.'
			},
			{
				name: 'Aspect Ratio',
				link: '/components/aspect-ratio',
				description: 'Maintains consistent width-to-height ratio.'
			},
			{
				name: 'Card',
				link: '/components/card',
				description: 'Container with header, footer, and content sections.'
			},
			{
				name: 'Collapsible',
				link: '/components/collapsible',
				description: 'An interactive component that can be expanded or collapsed.'
			},
			{
				name: 'Drawer',
				link: '/components/drawer',
				description: 'A panel that slides in from the edge of the screen.'
			},
			{
				name: 'Resizable',
				link: '/components/resizable',
				description: 'Resize elements with mouse or touch input.'
			},
			{
				name: 'Scroll Area',
				link: '/components/scroll-area',
				description: 'Custom scrollable container with consistent design.'
			},
			{
				name: 'Separator',
				link: '/components/separator',
				description: 'A visual divider between content.'
			},
			{
				name: 'Sheet',
				link: '/components/sheet',
				description: 'A modal dialog that slides from the edge of the screen.'
			}
		]
	},
	{
		name: 'Forms',
		icon: FormInput,
		components: [
			{ name: 'Button', link: '/components/button', description: 'Trigger an action or event.' },
			{
				name: 'Checkbox',
				link: '/components/checkbox',
				description: 'Allow users to select multiple items.'
			},
			{
				name: 'Combobox',
				link: '/components/combobox',
				description: 'Autocomplete input with options list.'
			},
			{
				name: 'Form',
				link: '/components/form',
				description: 'Building accessible forms with validation.'
			},
			{ name: 'Input', link: '/components/input', description: 'Basic text input component.' },
			{
				name: 'Input OTP',
				link: '/components/input-otp',
				description: 'One-time password input component.'
			},
			{ name: 'Label', link: '/components/label', description: 'Form label component.' },
			{
				name: 'Radio Group',
				link: '/components/radio-group',
				description: 'Select a single option from a list.'
			},
			{
				name: 'Select',
				link: '/components/select',
				description: 'Displays a dropdown list of options.'
			},
			{ name: 'Slider', link: '/components/slider', description: 'Select a value from a range.' },
			{ name: 'Switch', link: '/components/switch', description: 'A toggle between two states.' },
			{ name: 'Textarea', link: '/components/textarea', description: 'Multi-line text input.' }
		]
	},
	{
		name: 'Data Display',
		icon: Table2,
		components: [
			{
				name: 'Table',
				link: '/components/table',
				description: 'Display tabular data efficiently.'
			},
			{
				name: 'Data Table',
				link: '/components/data-table',
				description: 'Enhanced table with sorting, filtering, and pagination.'
			},
			{
				name: 'Badge',
				link: '/components/badge',
				description: 'Small status descriptor for UI elements.'
			},
			{
				name: 'Calendar',
				link: '/components/calendar',
				description: 'Calendar component for date selection.'
			},
			{
				name: 'Avatar',
				link: '/components/avatar',
				description: 'Image element with fallback for user profiles.'
			},
			{
				name: 'Progress',
				link: '/components/progress',
				description: 'Displays progress status of a task.'
			}
		]
	},
	{
		name: 'Overlays',
		icon: PanelTop,
		components: [
			{ name: 'Alert', link: '/components/alert', description: 'Displays important messages.' },
			{
				name: 'Alert Dialog',
				link: '/components/alert-dialog',
				description: 'A modal dialog that interrupts the user.'
			},
			{
				name: 'Dialog',
				link: '/components/dialog',
				description: 'Modal window overlaid on the UI.'
			},
			{
				name: 'Dropdown Menu',
				link: '/components/dropdown-menu',
				description: 'Display a menu when triggered by a button.'
			},
			{
				name: 'Hover Card',
				link: '/components/hover-card',
				description: 'Preview card that appears when hovering over an element.'
			},
			{
				name: 'Popover',
				link: '/components/popover',
				description: 'Float content next to an element.'
			},
			{ name: 'Tooltip', link: '/components/tooltip', description: 'Show information on hover.' },
			{
				name: 'Sonner',
				link: '/components/sonner',
				description: 'A toast notification component.'
			}
		]
	},
	{
		name: 'Navigation',
		icon: MousePointer,
		components: [
			{
				name: 'Breadcrumb',
				link: '/components/breadcrumb',
				description: 'Displays the current location within a hierarchy.'
			},
			{
				name: 'Command',
				link: '/components/command',
				description: 'Command menu for quick actions.'
			},
			{
				name: 'Context Menu',
				link: '/components/context-menu',
				description: 'Right-click menu with custom options.'
			},
			{
				name: 'Menubar',
				link: '/components/menubar',
				description: 'A horizontal menu with dropdown submenus.'
			},
			{
				name: 'Pagination',
				link: '/components/pagination',
				description: 'Navigate through pages of content.'
			},
			{
				name: 'Tabs',
				link: '/components/tabs',
				description: 'Switch between different sections of content.'
			}
		]
	},
	{
		name: 'Misc',
		icon: Sparkles,
		components: [
			{
				name: 'Skeleton',
				link: '/components/skeleton',
				description: 'Placeholder for loading UI elements.'
			},
			{
				name: 'Toggle',
				link: '/components/toggle',
				description: 'Two-state button that can be toggled on or off.'
			},
			{
				name: 'Toggle Group',
				link: '/components/toggle-group',
				description: 'Group of toggle buttons.'
			},
			{
				name: 'Range Calendar',
				link: '/components/range-calendar',
				description: 'Select a range of dates.'
			},
			{
				name: 'Date Picker',
				link: '/components/date-picker',
				description: 'Select a date from a calendar.'
			}
		]
	}
];

export default componentCategories;
