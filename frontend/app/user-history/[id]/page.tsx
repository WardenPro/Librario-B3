import UserHistoryClient from "@/app/user-history/[id]/UserHistoryClient";

type Props = {
    params: {
        id: string;
    };
};

export default function UserHistoryPage({ params }: Props) {
    return (
        <div className="space-y-4">
            <UserHistoryClient userId={params.id} />
        </div>
    );
} 