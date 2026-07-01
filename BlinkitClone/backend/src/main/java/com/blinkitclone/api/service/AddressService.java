package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.AddressRequest;
import com.blinkitclone.api.entity.Address;
import java.util.List;

public interface AddressService {
    Address addAddress(Long userId, AddressRequest request);
    List<Address> getAddressesByUserId(Long userId);
    Address getAddressById(Long addressId, Long userId);
    Address updateAddress(Long addressId, Long userId, AddressRequest request);
    void deleteAddress(Long addressId, Long userId);
}
