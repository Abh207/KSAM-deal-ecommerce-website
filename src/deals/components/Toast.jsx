import { CheckCircle2, X } from "lucide-react";


function Toast({
    message,
    onClose
}) {

    if (!message)
        return null;


    return (

        <div
            className="
                fixed
                bottom-6
                right-6
                z-[100]
                flex
                max-w-sm
                items-center
                gap-3
                rounded-2xl
                border
                border-[#22FF88]/30
                bg-[#0a0a0a]/95
                px-5
                py-4
                text-white
                shadow-[0_0_35px_rgba(34,255,136,.15)]
                backdrop-blur-xl
            "
            role="status"
            aria-live="polite"
        >

            <CheckCircle2
                className="text-[#22FF88]"
            />

            <span className="flex-1 text-sm">
                {message}
            </span>

            <button
                onClick={onClose}
                aria-label="Close notification"
            >
                <X
                    size={17}
                    className="text-gray-500"
                />
            </button>

        </div>

    );

}

export default Toast;