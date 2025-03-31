// export default function ShareButtons({ url, title }: ShareButtonsProps) {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(url);
//     toast.success('Link copied to clipboard!');
//   };

//   return (
//     <div className="space-y-4">
//       <h3 className="font-medium">Share Game</h3>
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={copyToClipboard}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
//         >
//           <Link2 size={18} />
//           <span>Copy Link</span>
//         </button>
//         {/* 其他社交分享按钮 */}
//       </div>
//       <p className="text-sm text-gray-500">
//         Share and play with others!
//       </p>
//     </div>
//   );
// } 