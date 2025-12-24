'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    ArrowLeft,
    Phone,
    MoreVertical,
    Image as ImageIcon,
    Smile
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    limit
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    createdAt: Timestamp | null;
}

interface RideChatProps {
    rideId: string;
    rideName?: string;
    onBack?: () => void;
}

// Message Bubble Component
const MessageBubble = ({
    message,
    isOwn
}: {
    message: Message;
    isOwn: boolean;
}) => {
    const time = message.createdAt?.toDate();

    return (
        <div className={cn(
            "flex gap-2 mb-3",
            isOwn ? "flex-row-reverse" : "flex-row"
        )}>
            {!isOwn && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.senderPhoto} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                        {message.senderName?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-[75%]",
                isOwn ? "items-end" : "items-start"
            )}>
                {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                        {message.senderName?.split(' ')[0]}
                    </p>
                )}
                <div className={cn(
                    "px-4 py-2 rounded-2xl",
                    isOwn
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm"
                )}>
                    <p className="text-sm">{message.text}</p>
                </div>
                {time && (
                    <p className={cn(
                        "text-[10px] text-gray-400 mt-1",
                        isOwn ? "text-right mr-1" : "ml-1"
                    )}>
                        {format(time, 'h:mm a')}
                    </p>
                )}
            </div>
        </div>
    );
};

// Date Separator Component
const DateSeparator = ({ date }: { date: Date }) => {
    const getDateLabel = () => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d, yyyy');
    };

    return (
        <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-full">
                {getDateLabel()}
            </span>
        </div>
    );
};

export default function RideChat({ rideId, rideName, onBack }: RideChatProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [user, setUser] = React.useState<User | null>(null);
    const [isSending, setIsSending] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Auth listener
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Messages listener
    React.useEffect(() => {
        if (!rideId) return;

        const messagesRef = collection(db, 'rides', rideId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages: Message[] = [];
            snapshot.forEach((doc) => {
                newMessages.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(newMessages);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });

        return () => unsubscribe();
    }, [rideId]);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!user || !newMessage.trim() || isSending) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const messagesRef = collection(db, 'rides', rideId, 'messages');
            await addDoc(messagesRef, {
                text: messageText,
                senderId: user.uid,
                senderName: user.displayName || 'Anonymous',
                senderPhoto: user.photoURL || '',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    // Group messages by date
    const groupedMessages = React.useMemo(() => {
        const groups: { date: Date; messages: Message[] }[] = [];
        let currentDate: string | null = null;

        messages.forEach((msg) => {
            const msgDate = msg.createdAt?.toDate() || new Date();
            const dateStr = format(msgDate, 'yyyy-MM-dd');

            if (dateStr !== currentDate) {
                currentDate = dateStr;
                groups.push({ date: msgDate, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        });

        return groups;
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:bg-white/30"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div className="flex-1">
                    <h2 className="font-semibold">{rideName || 'Ride Chat'}</h2>
                    <p className="text-xs text-white/80">
                        {messages.length > 0 ? `${messages.length} messages` : 'Start chatting'}
                    </p>
                </div>
                <button
                    className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center active:bg-white/30"
                    aria-label="More options"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <ScrollArea
                ref={scrollRef}
                className="flex-1 px-4 py-4"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Start the conversation!
                        </p>
                    </div>
                ) : (
                    groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <DateSeparator date={group.date} />
                            {group.messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isOwn={msg.senderId === user?.uid}
                                />
                            ))}
                        </div>
                    ))
                )}
            </ScrollArea>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
            >
                <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500"
                    aria-label="Add emoji"
                >
                    <Smile className="w-5 h-5" />
                </button>

                <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-10 bg-white dark:bg-gray-700 border-0 rounded-xl"
                    disabled={!user || isSending}
                />

                <Button
                    type="submit"
                    size="icon"
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600"
                    disabled={!newMessage.trim() || isSending}
                    aria-label="Send message"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
