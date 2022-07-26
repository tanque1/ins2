import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function LikeButton({
  isLike,
  handleLike = null,
  handleUnLike = null,
}) {
  return (
    <>
      {isLike ? (
        <FaHeart onClick={handleUnLike} className="text-red-500 cursor-pointer"/>
      ) : (
        <FaRegHeart onClick={handleLike} className='cursor-pointer dark:text-white'/>
      )}
    </>
  );
}
