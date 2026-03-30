import PaymentList from '../../components/payments/PaymentList';
import SidebarLayout from '../../components/layout/sidebar';

export default function Payments() {
    return (
        <SidebarLayout subtitle="Payments">
            <PaymentList />
        </SidebarLayout>
    );
}
