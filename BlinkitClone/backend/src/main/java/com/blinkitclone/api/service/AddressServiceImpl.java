package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.AddressRequest;
import com.blinkitclone.api.entity.Address;
import com.blinkitclone.api.entity.User;
import com.blinkitclone.api.exception.BadRequestException;
import com.blinkitclone.api.exception.ResourceNotFoundException;
import com.blinkitclone.api.repository.AddressRepository;
import com.blinkitclone.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Address addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Address> userAddresses = addressRepository.findByUserId(userId);
        
        // If this is the first address, force it to be default
        boolean shouldBeDefault = userAddresses.isEmpty() || request.isDefault();

        if (shouldBeDefault) {
            resetDefaultAddresses(userId);
        }

        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .isDefault(shouldBeDefault)
                .build();

        return addressRepository.save(address);
    }

    @Override
    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Override
    public Address getAddressById(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this address");
        }
        return address;
    }

    @Override
    @Transactional
    public Address updateAddress(Long addressId, Long userId, AddressRequest request) {
        Address address = getAddressById(addressId, userId);

        if (request.isDefault() && !address.isDefault()) {
            resetDefaultAddresses(userId);
            address.setDefault(true);
        } else if (!request.isDefault() && address.isDefault()) {
            // Keep default if it's the only address
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            if (userAddresses.size() > 1) {
                address.setDefault(false);
            }
        }

        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPinCode(request.getPinCode());

        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = getAddressById(addressId, userId);
        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        // If default address was deleted, promote another address to default
        if (wasDefault) {
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            if (!userAddresses.isEmpty()) {
                Address newDefault = userAddresses.getFirst();
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> userAddresses = addressRepository.findByUserId(userId);
        for (Address addr : userAddresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
