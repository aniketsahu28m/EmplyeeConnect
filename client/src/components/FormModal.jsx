import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LuX } from 'react-icons/lu';

const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                  <Dialog.Title as="h3" className="text-[15px] font-semibold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="-mr-1.5 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <LuX className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={onSubmit}>
                  <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4 [&_label]:text-[13px] [&_label]:text-gray-800">{children}</div>
                  <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-5 py-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="btn-secondary">
                      {cancelText}
                    </button>
                    <button type="submit" className="btn-primary">
                      {submitText}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FormModal;
