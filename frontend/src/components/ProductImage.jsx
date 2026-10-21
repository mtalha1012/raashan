// Product photo, or the category's emoji on a tinted tile when there is no photo
const TINTS = ['bg-ink-soft', 'bg-haldi-soft', 'bg-leaf-soft', 'bg-margin-soft'];

const tintFor = (text = '') => TINTS[[...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length];

export default function ProductImage({ product, size = 'md', className = '' }) {
    const sizes = {
        sm: 'h-10 w-10 text-xl rounded-lg',
        md: 'h-full w-full text-5xl rounded-xl',
        lg: 'h-full w-full text-8xl rounded-2xl',
    };

    if (product?.image) {
        return (
            <img
                src={product.image}
                alt=""
                loading="lazy"
                className={`${sizes[size]} object-cover ${className}`}
            />
        );
    }

    return (
        <div className={`${sizes[size]} ${tintFor(product?.category?.name || product?.name)} grid place-items-center ${className}`}>
            <span aria-hidden="true">{product?.category?.icon || '🛒'}</span>
        </div>
    );
}
