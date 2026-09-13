import InstructorChatInbox from '../instructor/InstructorChatInbox'
import '../instructor/InstructorChatInbox.css'
import './AdminMessagesPage.css'

export default function AdminMessagesPage() {
    return (
        <div className="admin-messages">
            <div className="admin-page-header">
                <div>
                    <h1>Messages</h1>
                    <p>Receive and reply to learner and instructor messages.</p>
                </div>
            </div>
            <InstructorChatInbox
                contactsUrl="/api/chat/admin/contacts"
                heading="User Inbox"
                searchPlaceholder="Search users by name or email..."
                personLabel="user"
                defaultMode="GENERAL"
            />
        </div>
    )
}
