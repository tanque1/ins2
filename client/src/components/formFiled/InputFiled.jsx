import React from 'react'
import { Controller } from 'react-hook-form'

export default function InputFiled({control,name,label,errors ,type ='text'}) {
  return (
    <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div className={`flex flex-col-reverse`}>
                {errors[name] ?<p className="text-[12px] text-red-500">{errors[name]?.message}</p>:null}
              <input
                className={`${errors[name] ? 'border-red-600':null} p-1 peer outline-none border-2 transition rounded dark:text-dark-subtle  dark:border-dark-subtle border-light-subtle focus:border-primary bg-transparent focus:dark:border-white focus:border-primary`}
                type={type}
                {...field}
              />
              <label htmlFor="" className="dark:peer-focus:text-white peer-focus:text-primary text-light-subtle dark:text-dark-subtle font-semibold transition">
                {label}
              </label>
            </div>
          )}
        />
  )
}
