const Icon = ({ children, className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...props}
    >
        {children}
    </svg>
);

export const CartIcon = (props) => (
    <Icon {...props}>
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6" />
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
    </Icon>
);

export const ListIcon = (props) => (
    <Icon {...props}>
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
    </Icon>
);

export const PlusIcon = (props) => (
    <Icon {...props}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);

export const MinusIcon = (props) => (
    <Icon {...props}>
        <path d="M5 12h14" />
    </Icon>
);

export const TrashIcon = (props) => (
    <Icon {...props}>
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </Icon>
);

export const CheckIcon = (props) => (
    <Icon {...props}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </Icon>
);

export const CloseIcon = (props) => (
    <Icon {...props}>
        <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
);

export const ArrowIcon = (props) => (
    <Icon {...props}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
);

export const SearchIcon = (props) => (
    <Icon {...props}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-4-4" />
    </Icon>
);

export const ChatIcon = (props) => (
    <Icon {...props}>
        <path d="M4 5h16v11H9l-5 4z" />
    </Icon>
);
