import ProductDetail from './components/ProductDetail';
import { Suspense } from 'react';
import LoadingUI from '@/app/components/LoadingUI';
import Hero from './components/Hero';

interface PageProps {
    params: Promise<{
        productId: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { productId } = await params;

    return (
        <main>
            <Hero />
            <Suspense fallback={<LoadingUI />}>
                <ProductDetail productId={productId} />
            </Suspense>

        </main>
    );
} 